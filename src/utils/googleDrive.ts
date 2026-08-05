export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

/**
 * List files from user's Google Drive.
 */
export async function listDriveFiles(accessToken: string): Promise<DriveFile[]> {
  const query = encodeURIComponent("trashed=false");
  const fields = encodeURIComponent("files(id, name, mimeType, createdTime, modifiedTime, size)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=30&orderBy=modifiedTime%20desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Google Drive files (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Upload a string content or CSV/JSON report to Google Drive.
 */
export async function uploadToDrive(
  accessToken: string,
  filename: string,
  content: string,
  mimeType: string = 'text/csv'
): Promise<DriveFile> {
  const metadata = {
    name: filename,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime,modifiedTime,size', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to upload to Google Drive (${response.status})`);
  }

  return await response.json();
}

/**
 * Read text content from a Google Drive file by ID.
 */
export async function downloadDriveFile(accessToken: string, fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to download file from Google Drive (${response.status})`);
  }

  return await response.text();
}

/**
 * Delete a file from Google Drive after explicit user confirmation.
 */
export async function deleteDriveFile(accessToken: string, fileId: string, fileName: string): Promise<void> {
  const confirmed = window.confirm(`Are you sure you want to delete "${fileName}" from your Google Drive? This operation cannot be undone.`);
  if (!confirmed) return;

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete file from Google Drive (${response.status})`);
  }
}
