
const numericCharacters           = '0123456789';
const numericCharactersLen        = numericCharacters.length;
const alfaNumericCharacters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const alfaNumericCharactersLen    = alfaNumericCharacters.length;

exports.getRandomCode = function(length, isNumericOnly) {
  let result = '',
    len     = isNumericOnly ? numericCharactersLen  : alfaNumericCharactersLen,
    charSet = isNumericOnly ? numericCharacters     : alfaNumericCharacters;

  for (let i = 0; i < length; i++) {
    result += charSet.charAt(Math.floor(Math.random() * len));
  }
  return result;
};
