import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { supabase } from './supabase'

let s3Client = null
let cachedConfig = null
let cachedProfileId = null
let configLoadTime = 0
const CONFIG_CACHE_DURATION = 5000

const loadStorageConfig = async () => {
  const now = Date.now()
  
  if (cachedConfig && (now - configLoadTime) < CONFIG_CACHE_DURATION) {
    return { config: cachedConfig, profileId: cachedProfileId }
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      cachedConfig = null
      cachedProfileId = null
      configLoadTime = now
      return { config: null, profileId: null }
    }
    
    const { data, error } = await supabase
      .from('storage_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()
    
    if (error || !data || !data.endpoint || !data.access_key_id || !data.secret_access_key || !data.bucket) {
      cachedConfig = null
      cachedProfileId = null
    } else {
      cachedConfig = {
        endpoint: data.endpoint,
        region: data.region || 'us-east-1',
        credentials: {
          accessKeyId: data.access_key_id,
          secretAccessKey: data.secret_access_key
        },
        bucket: data.bucket
      }
      cachedProfileId = data.id
    }
    
    configLoadTime = now
    return { config: cachedConfig, profileId: cachedProfileId }
  } catch (err) {
    console.error('Failed to load storage config:', err)
    cachedConfig = null
    cachedProfileId = null
    configLoadTime = now
    return { config: null, profileId: null }
  }
}

const checkSettingsUpdated = () => {
  const updated = localStorage.getItem('storageSettingsUpdated')
  if (updated && cachedConfig) {
    const updatedTime = parseInt(updated)
    if (updatedTime > configLoadTime) {
      cachedConfig = null
      cachedProfileId = null
      configLoadTime = 0
    }
  }
}

const recreateS3Client = async () => {
  const { config } = await loadStorageConfig()
  if (!config) return null
  
  s3Client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: config.credentials
  })
  return s3Client
}

export const getActiveProfileId = async () => {
  const { profileId } = await loadStorageConfig()
  return profileId
}

export const uploadFileToStorage = async (data, fileName, mimeType, userId) => {
  const { config, profileId } = await loadStorageConfig()
  if (!config || !profileId) {
    throw new Error('No active storage profile')
  }
  
  await recreateS3Client()
  
  const key = `${profileId}/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: data,
    ContentType: mimeType
  })
  
  await s3Client.send(command)
  return { key, profileId }
}

export const getDownloadUrl = async (key) => {
  const { config } = await loadStorageConfig()
  if (!config) {
    throw new Error('No active storage profile')
  }
  
  await recreateS3Client()
  
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key
  })
  
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  return url
}

export const deleteFileFromStorage = async (key) => {
  const { config } = await loadStorageConfig()
  if (!config) {
    throw new Error('No active storage profile')
  }
  
  await recreateS3Client()
  
  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key
  })
  
  await s3Client.send(command)
}

export const clearStorageCache = () => {
  cachedConfig = null
  cachedProfileId = null
  configLoadTime = 0
  s3Client = null
}
