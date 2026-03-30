import OpenAI from 'openai';
import { defineEventHandler, readMultipartFormData, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const apiKey = process.env.TYPHOON_API_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TYPHOON_API_KEY is not configured',
    });
  }

  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No audio file provided',
    });
  }

  const audioFile = formData.find(f => f.name === 'file');
  if (!audioFile) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Field "file" is missing',
    });
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.opentyphoon.ai/v1',
  });

  try {
    // Step 1: Normalize MIME type for Typhoon ASR compatibility
    // Many browsers send audio/mpeg for mp3, but Typhoon specifically says audio/mpeg not supported
    let mimeType = audioFile.type || '';
    const filename = (audioFile.filename || '').toLowerCase();

    if (filename.endsWith('.mp3') || mimeType === 'audio/mpeg') mimeType = 'audio/mp3';
    else if (filename.endsWith('.wav')) mimeType = 'audio/wav';
    else if (filename.endsWith('.flac')) mimeType = 'audio/flac';
    else if (filename.endsWith('.ogg')) mimeType = 'audio/ogg';
    else if (filename.endsWith('.opus')) mimeType = 'audio/opus';
    
    if (!mimeType) mimeType = 'audio/mp3';

    // Using OpenAI's helper to create a File object from Buffer which is safer
    const file = await OpenAI.toFile(audioFile.data, audioFile.filename || 'audio.mp3', {
       type: mimeType
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'typhoon-asr-realtime',
    });

    return transcription;

  } catch (error: any) {
    console.error('ASR API Error Details:', error);
    
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || 'Error transcribing audio',
      data: error.response?.data
    });
  }
});
