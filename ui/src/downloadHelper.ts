export function makeDownload(data: string, filename: string, type = 'text/plain'): void {
  const link = document.createElement('a');

  link.download = filename;
  link.href = URL.createObjectURL(
    new Blob([data], {type})
  );

  link.click();
}