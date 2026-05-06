import { sql } from 'drizzle-orm';
import { useHosxpDb } from '../../utils/hosxpDb';

export default defineEventHandler(async (event) => {
  // Check auth session
  const session = await requireUserSession(event);

  const query = getQuery(event);
  const startDate = query.startDate as string || new Date().toISOString().split('T')[0];
  const endDate = query.endDate as string || new Date().toISOString().split('T')[0];

  const dateTimeStart = `${startDate} 08:00:00`;
  const dateTimeEnd = `${endDate} 16:00:00`;

  try {
    const hosxpDb = useHosxpDb();

    // Use English aliases in the SQL to avoid encoding issues with MariaDB/Drizzle
    // Then we map them to the Thai keys in the final object
    const [rawStats]: any[] = await hosxpDb.execute(sql`
      SELECT 
        departmentname,
        SEC_TO_TIME(AVG(wait_screen_diff)) AS wait_screen,
        SEC_TO_TIME(AVG(screen_diff)) AS screen_duration,
        SEC_TO_TIME(AVG(wait_doc1_diff)) AS wait_doctor1,
        SEC_TO_TIME(AVG(wait_doc2_diff)) AS wait_doctor2,
        SEC_TO_TIME(AVG(doc_time_diff)) AS doctor_exam,
        SEC_TO_TIME(AVG(wait_rx_diff)) AS wait_rx,
        -- Recalculated Total from segments as requested
        SEC_TO_TIME(AVG(wait_screen_diff) + AVG(screen_diff) + AVG(wait_doc1_diff) + AVG(doc_time_diff) + AVG(wait_rx_diff)) AS total_all_time,
        -- Old direct total commented out
        -- SEC_TO_TIME(AVG(total_all_diff)) AS total_all_time_old,
        
        -- Minute conversion for UI bars
        AVG(wait_screen_diff)/60 AS m_wait_screen, 
        AVG(screen_diff)/60 AS m_screen, 
        AVG(wait_doc1_diff)/60 AS m_wait_doc1, 
        AVG(wait_doc2_diff)/60 AS m_wait_doc2, 
        AVG(doc_time_diff)/60 AS m_doc_time, 
        AVG(wait_rx_diff)/60 AS m_wait_rx,
        -- Recalculated Minutes
        (AVG(wait_screen_diff) + AVG(screen_diff) + AVG(wait_doc1_diff) + AVG(doc_time_diff) + AVG(wait_rx_diff))/60 AS m_total_all
        -- Old m_total_all commented out
        -- AVG(total_all_diff)/60 AS m_total_all_old
      FROM (
        SELECT 
          ov.vn, 
          s.department AS departmentname,
          TIMESTAMPDIFF(SECOND, 
            (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code LIKE 'OPD-NEW-VISIT%'), 
            (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-SCREEN')
          ) AS wait_screen_diff,
          
          TIMESTAMPDIFF(SECOND, 
            (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-SCREEN'), 
            (SELECT MIN(service_end_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-SCREEN')
          ) AS screen_diff,
          
          TIMESTAMPDIFF(SECOND, 
            (SELECT MIN(service_end_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-SCREEN'), 
            (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-DOCTOR')
          ) AS wait_doc1_diff,
          
          TIMESTAMPDIFF(SECOND, 
            (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code LIKE 'OPD-NEW-VISIT%'), 
            (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-DOCTOR')
          ) AS wait_doc2_diff,
          
          TIMESTAMPDIFF(SECOND, 
            (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-DOCTOR'), 
            (SELECT MIN(service_end_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-DOCTOR')
          ) AS doc_time_diff,
          
          TIMESTAMPDIFF(SECOND, 
            (SELECT TIME(MIN(rxtime)) FROM opitemrece WHERE vn = ov.vn AND icode LIKE '10%'), 
            (SELECT TIME(MIN(rx_dispenser_datetime)) FROM rx_dispenser_detail WHERE vn = ov.vn LIMIT 1)
          ) AS wait_rx_diff,
          
          TIMESTAMPDIFF(SECOND, 
            (SELECT TIME(MIN(service_begin_datetime)) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code LIKE 'OPD-NEW-VISIT%'), 
            (SELECT TIME(MIN(rx_dispenser_datetime)) FROM rx_dispenser_detail WHERE vn = ov.vn LIMIT 1)
          ) AS total_all_diff
          
        FROM ovst ov
        JOIN kskdepartment s ON ov.main_dep = s.depcode
        WHERE CONCAT(ov.vstdate, ' ', ov.vsttime) BETWEEN ${dateTimeStart} AND ${dateTimeEnd} 
        AND s.depcode = '010'
        AND ov.vsttime BETWEEN '08:00:00' AND '16:00:00'
      ) tt
      GROUP BY departmentname 
      HAVING AVG(total_all_diff) IS NOT NULL
    `);

    if (!rawStats || rawStats.length === 0) {
      return { stats: null, metadata: { startDate, endDate } };
    }

    const row = rawStats[0];

    // 2. Hourly Breakdown: รอซักประวัติ (Wait Screen)
    const [hourlyScreen]: any[] = await hosxpDb.execute(sql`
      SELECT 
          visit_hour,
          COUNT(vn) AS patient_count,
          ROUND(AVG(NULLIF(wait_screen_seconds, 0)) / 60, 2) AS avg_wait_minutes,
          ROUND(MAX(NULLIF(wait_screen_seconds, 0)) / 60, 2) AS max_wait_minutes
      FROM (
          SELECT 
              ov.vn,
              HOUR(ov.vsttime) AS visit_hour,
              TIMESTAMPDIFF(SECOND, 
                  COALESCE(
                      (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code LIKE 'OPD-NEW-VISIT%'),
                      CONCAT(ov.vstdate, ' ', ov.vsttime)
                  ), 
                  (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-SCREEN')
              ) AS wait_screen_seconds
          FROM ovst ov
          WHERE ov.vstdate BETWEEN ${startDate} AND ${endDate}
          AND ov.main_dep = '010'
          AND ov.vsttime BETWEEN '08:00:00' AND '16:59:59'
      ) AS base_data
      WHERE wait_screen_seconds >= 0 AND wait_screen_seconds < 28800
      GROUP BY visit_hour
      HAVING patient_count > 0
      ORDER BY visit_hour
    `);

    // 3. Hourly Breakdown: รอตรวจ (Wait Doctor)
    const [hourlyDoctor]: any[] = await hosxpDb.execute(sql`
      SELECT 
          visit_hour,
          COUNT(vn) AS patient_count,
          ROUND(AVG(NULLIF(wait_doctor_seconds, 0)) / 60, 2) AS avg_wait_minutes,
          ROUND(MAX(NULLIF(wait_doctor_seconds, 0)) / 60, 2) AS max_wait_minutes
      FROM (
          SELECT 
              ov.vn,
              HOUR(ov.vsttime) AS visit_hour,
              TIMESTAMPDIFF(SECOND, 
                  COALESCE(
                      (SELECT MIN(service_end_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code LIKE 'OPD-SCREEN'),
                      CONCAT(ov.vstdate, ' ', ov.vsttime)
                  ), 
                  (SELECT MIN(service_begin_datetime) FROM ovst_service_time WHERE vn = ov.vn AND ovst_service_time_type_code = 'OPD-DOCTOR')
              ) AS wait_doctor_seconds
          FROM ovst ov
          WHERE ov.vstdate BETWEEN ${startDate} AND ${endDate}
          AND ov.main_dep = '010'
          AND ov.vsttime BETWEEN '08:00:00' AND '16:59:59'
      ) AS base_data
      WHERE wait_doctor_seconds >= 0 AND wait_doctor_seconds < 28800
      GROUP BY visit_hour
      HAVING patient_count > 0
      ORDER BY visit_hour
    `);

    // 4. Visit Traffic for OPD 7 (010) specifically
    const [traffic]: any[] = await hosxpDb.execute(sql`
      SELECT 
          HOUR(vsttime) as hour, 
          COUNT(vn) as total 
      FROM ovst 
      WHERE vstdate BETWEEN ${startDate} AND ${endDate}
      AND main_dep = '010'
      AND vsttime BETWEEN '08:00:00' AND '16:59:59'
      GROUP BY hour 
      ORDER BY hour
    `);

    // Map back to the Thai keys for the Frontend
    return {
      stats: {
        departmentname: row.departmentname,
        'รอซักประวัติ': row.wait_screen,
        'ซักประวัติ': row.screen_duration,
        'รอตรวจ1': row.wait_doctor1,
        'รอตรวจ2': row.wait_doctor2,
        'แพทย์ตรวจ': row.doctor_exam,
        'รอรับยา': row.wait_rx,
        'total_all': row.total_all_time,

        m_wait_screen: row.m_wait_screen,
        m_screen: row.m_screen,
        m_wait_doc1: row.m_wait_doc1,
        m_wait_doc2: row.m_wait_doc2,
        m_doc_time: row.m_doc_time,
        m_wait_rx: row.m_wait_rx,
        m_total_all: row.m_total_all
      },
      hourly_screen: hourlyScreen,
      hourly_doctor: hourlyDoctor,
      traffic: traffic,
      metadata: { startDate, endDate }
    };

  } catch (err: any) {
    console.error('Waiting Time API Error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching waiting time data',
      data: err.message
    });
  }
});
