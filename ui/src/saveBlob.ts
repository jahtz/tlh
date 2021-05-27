export function saveBlob(content: string, fileName: string): void {
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.hidden = true;

  const file = new Blob([content]);

  const url = window.URL.createObjectURL(file);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
