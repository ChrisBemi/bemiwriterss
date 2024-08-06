const generateUniqueFilename = (originalName) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    return `${uniqueSuffix}-${originalName}`;
  };
  
  module.exports = generateUniqueFilename;
  