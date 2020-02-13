function generateUUID(): number {
  return Math.floor(Math.random() * 26) + Date.now();
}
