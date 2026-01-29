import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import type { DatasheetData } from "@/app/_lib/datasheet/types";

const MAX_IDS = 20;
const DATASHEET_DATA_DIR = join(process.cwd(), "app/_lib/datasheet/data");

/**
 * データシート取得API
 * GET /api/datasheet?ids=GRM188R60J105KA01-01,GRM185R61C105KE44-01
 * 
 * 複数のdatasheet_idを受け取り、存在するデータシートJSONを返却
 * 上限20件まで対応
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "ids query parameter is required" },
        { status: 400 }
      );
    }

    // カンマ区切りで分割
    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "At least one id is required" },
        { status: 400 }
      );
    }

    if (ids.length > MAX_IDS) {
      return NextResponse.json(
        {
          error: `Too many ids. Maximum ${MAX_IDS} ids are allowed per request`,
        },
        { status: 400 }
      );
    }

    // 各IDに対応するJSONファイルを読み込み
    const results: Record<string, DatasheetData> = {};

    await Promise.all(
      ids.map(async (id) => {
        try {
          const filePath = join(DATASHEET_DATA_DIR, `${id}.json`);
          const fileContent = await readFile(filePath, "utf-8");
          const datasheetData: DatasheetData = JSON.parse(fileContent);
          results[id] = datasheetData;
        } catch (error) {
          // ファイルが存在しない、または読み込みエラーの場合は無視
          // 存在するデータのみを返却する
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Datasheet API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to fetch datasheet data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
