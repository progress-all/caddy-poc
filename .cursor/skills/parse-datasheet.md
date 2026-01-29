# parse-datasheet

村田製作所のMLCC (チップ積層セラミックコンデンサ) データシートPDFを解析し、構造化されたパラメータCSVを生成するスキル。

## 呼び出し方

```
/parse-datasheet <datasheet-id> @<pdf-file>
```

### 引数

- `<datasheet-id>`: データシートの識別子 (例: `GRM185R60J105KE26-01`)
- `@<pdf-file>`: 解析対象のPDFファイル

### 例

```
/parse-datasheet GRM155R60J105KE11-01 @path/to/datasheet.pdf
```

## 処理フロー

### Step 1: ディレクトリ作成とPDF配置

```bash
mkdir -p docs/datasheet/<datasheet-id>
cp <pdf-file> docs/datasheet/<datasheet-id>/<datasheet-id>.pdf
```

### Step 2: PDFからテキスト抽出

```bash
python docs/datasheet/scripts/extract_pdf_text.py \
  docs/datasheet/<datasheet-id>/<datasheet-id>.pdf \
  docs/datasheet/<datasheet-id>/<datasheet-id>.txt
```

### Step 3: パラメータ抽出

抽出されたテキストファイル `<datasheet-id>.txt` を読み込み、以下のルールに従ってパラメータを抽出しCSVを生成する。

#### 抽出ルール

1. **値の正規化**:
   - 単位は原文のまま保持 (mm, V, °C, %, Ω·F など)
   - 範囲は "to" で表現 (例: "1 to 5 s")
   - 許容差は "±" で表現 (例: "± 10%")
   - 非対称許容差は "+X/-Y" で表現 (例: "+0/-0.1")

2. **欠損値の扱い**:
   - データシートに記載がない場合は空欄
   - 該当製品に適用されない項目も空欄

3. **製品タイプの確認**:
   - 「Temperature Compensating Type」と「High Dielectric Constant Type」で仕様が異なる場合がある
   - サイズコード (GRM15, GRM18, GRM21 など) によって一部仕様が異なる

#### 抽出対象パラメータ

パラメーター定義は `docs/datasheet/params/params-schema.yaml` で一元管理されています。

このYAMLファイルには以下の情報が含まれています：
- `id`: パラメーターID
- `description`: パラメーターの説明
- `category`: カテゴリー（dimensions, rated_values, packaging, test_specs）
- `extraction_hint`: LLMによる抽出時のヒント

LLMによる抽出時は、このYAMLファイルをプロンプトに含めて、各パラメーターの `extraction_hint` を参考にデータシートから値を抽出してください。

### Step 4: CSV/JSON出力

抽出結果を以下の2形式で保存:

#### CSV出力

```
docs/datasheet/<datasheet-id>/<datasheet-id>.csv
```

フォーマット:
```csv
param_id,description,value
L_Dimensions,長さ (L寸法),1.6 ± 0.1 mm
W_Dimensions,幅 (W寸法),0.8 ± 0.1 mm
...
```

#### JSON出力

```
docs/datasheet/<datasheet-id>/<datasheet-id>.json
```

フォーマット:
```json
{
  "datasheet_id": "GRM185R60J105KE26-01",
  "version": "1.0",
  "parameters": {
    "L_Dimensions": {
      "description": "長さ (L寸法)",
      "value": "1.6 ± 0.1 mm"
    },
    "W_Dimensions": {
      "description": "幅 (W寸法)",
      "value": "0.8 ± 0.1 mm"
    }
  }
}
```

注意: データシートに記載がないパラメーターは、JSONでは `null` またはフィールドを省略してください。

## 出力ファイル構造

```
docs/datasheet/<datasheet-id>/
├── <datasheet-id>.pdf           # 元PDF
├── <datasheet-id>.txt           # 抽出テキスト
├── <datasheet-id>.csv           # パラメータCSV
└── <datasheet-id>.json          # パラメータJSON
```

## 参考ファイル

- パラメーター定義: `docs/datasheet/params/params-schema.yaml` (マスターファイル)
- 抽出スクリプト: `docs/datasheet/scripts/extract_pdf_text.py`
- 既存の抽出例: `docs/datasheet/GRM185R60J105KE26-01/`, `docs/datasheet/GRM188R60J105KA01-01/`
