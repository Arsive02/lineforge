import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus } from "@/lib/meshy";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const status = await getTaskStatus(taskId);

    return NextResponse.json({
      status: status.status,
      progress: status.progress,
      modelUrls: status.model_urls,
      thumbnailUrl: status.thumbnail_url,
      error: status.error,
    });
  } catch (err) {
    console.error("3D status poll error:", err);
    const message = err instanceof Error ? err.message : "Status check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
