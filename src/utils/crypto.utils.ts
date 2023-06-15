import crypto from 'crypto';
import env from '../env';

const algorithm = 'aes-256-gcm';
const secretKey = env().cryptoSecret;
const keyBuffer = Buffer.from(secretKey, 'utf8');
const keyLength = 32;
const keyHash = crypto.createHash('sha256').update(keyBuffer).digest();
const keyArray = new Uint8Array(keyHash.buffer, keyHash.byteOffset, keyLength);

function encrypt(data: string) {
  const iv = crypto.randomBytes(32);
  const cipher = crypto.createCipheriv(algorithm, keyArray, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

function decrypt(data: { iv: string; tag: string; encrypted: string }) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    keyArray,
    Buffer.from(data.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(data.tag, 'hex'));

  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export default {
  encrypt,
  decrypt,
};
