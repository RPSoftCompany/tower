import * as crypto from 'crypto';

/**
 * Encrypt password
 *
 * @param {string} password password to encrypt
 *
 * @return {string} encrypted password
 */
export const encryptPassword = (password) => {
  if (!password) {
    return '';
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.SECRET),
    iv,
  );
  let encrypted = cipher.update(`${password}`);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const out = iv.toString('hex').split('').reverse().join('');

  return out + ':' + encrypted.toString('hex');
};

/**
 * Decrypt password
 *
 * @param {string} password password to decrypt
 *
 * @return {string} decrypted password
 */
export const decryptPassword = (password) => {
  if (!password) {
    return '';
  }

  try {
    const textParts = password.split(':');
    const ivText = textParts.shift().split('').reverse().join('');
    const iv = Buffer.from(ivText, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(process.env.SECRET),
      iv,
    );
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (e) {
    return '';
  }
};
