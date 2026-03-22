import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { supabase } from './supabase'

let s3Client = null
let cachedConfig = null
let cachedProfileId = null
let configLoadTime = 0
let profileLoadTime = 0
const CONFIG_CACHE_DURATION = 60000
const PROFILE_CACHE_DURATION = 30000

const getActiveProfileIdCached = async () => {
  const now = Date.now()
  
  if (cachedProfileId && (now - profileLoadTime) < PROFILE_CACHE_DURATION) {
    return cachedProfileId
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      cachedProfileId = null
      profileLoadTime = now
      return null
    }
    
    const { data } = await supabase
      .from('storage_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()
    
    cachedProfileId = data?.id || null
    profileLoadTime = now
    return cachedProfileId
  } catch (err) {
    cachedProfileId = null
    profileLoadTime = now
    return null
  }
}

const getStorageConfig = async () => {
  const now = Date.now()
  
  if (cachedConfig && (now - configLoadTime) < CONFIG_CACHE_DURATION) {
    return cachedConfig
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      cachedConfig = null
      configLoadTime = now
      return null
    }
    
    const { data } = await supabase
      .from('storage_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()
    
    if (!data || !data.endpoint || !data.access_key_id || !data.secret_access_key || !data.bucket) {
      cachedConfig = null
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
    }
    
    configLoadTime = now
    return cachedConfig
  } catch (err) {
    cachedConfig = null
    configLoadTime = now
    return null
  }
}

const recreateS3Client = async () => {
  const config = await getStorageConfig()
  if (!config) return null
  
  s3Client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: config.credentials
  })
  return s3Client
}

export const getActiveProfileId = getActiveProfileIdCached

export const uploadFileToStorage = async (data, fileName, mimeType, userId) => {
  const config = await getStorageConfig()
  if (!config) {
    throw new Error('No active storage profile')
  }
  
  await recreateS3Client()
  
  const profileId = cachedProfileId || 'default'
  const key = `${profileId}/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: data,
    ContentType: mimeType
  })
  
  await s3Client.send(command)
  return { key, profileId: cachedProfileId }
}

export const getDownloadUrl = async (key) => {
  const config = await getStorageConfig()
  if (!config) {
    throw new Error('No active storage profile')
  }
  
  await recreateS3Client()
  
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key
  })
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export const deleteFileFromStorage = async (key) => {
  const config = await getStorageConfig()
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
  profileLoadTime = 0
  s3Client = null
}
