const MESHY_API_BASE = "https://api.meshy.ai/openapi/v1";

function getApiKey() {
  const key = process.env.MESHY_API_KEY;
  if (!key) throw new Error("MESHY_API_KEY not set");
  return key;
}

export interface MeshyTaskStatus {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED";
  progress: number;
  model_urls?: {
    glb?: string;
    obj?: string;
    fbx?: string;
  };
  thumbnail_url?: string;
  error?: string;
}

/**
 * Submit an image for 3D model generation.
 */
export async function submitImageTo3D(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const dataUri = `data:${mimeType};base64,${imageBase64}`;

  const response = await fetch(`${MESHY_API_BASE}/image-to-3d`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: dataUri,
      should_remesh: true,
      enable_pbr: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Meshy API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Get the status of a 3D generation task.
 */
export async function getTaskStatus(taskId: string): Promise<MeshyTaskStatus> {
  const response = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Meshy API error: ${response.status} — ${err}`);
  }

  return response.json();
}
