const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp']

export function validateCsvUpload(file: File): void {
  const name = file.name.toLowerCase()
  if (!name.endsWith('.csv')) {
    throw new Error('Only .csv files are accepted')
  }
  if (IMAGE_TYPES.includes(file.type)) {
    throw new Error('Image files are not accepted. Please upload a CSV file.')
  }
  if (file.size === 0) {
    throw new Error('File is empty')
  }
}
