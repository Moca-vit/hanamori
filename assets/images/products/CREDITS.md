# 商品画像の出典

## 全シリーズの商品写真（*.webp）と最初の画面の商品（../hero/hero-*.webp）
- ボトル・ジャー・袋の写真：画像生成AIで作成（花森/生成画像 の shampoo_* / treatment_* / bathbom_*）
- シャンプーのラベル：花森/生成画像 の label_*（各色）を、モック見本_white.jpg と同じ位置・大きさで、円柱のボトルに金で印刷したように合成
- トリートメント・入浴剤のラベル：同じロゴを使い、同じ書体（Copperplate Bold／ヒラギノ明朝）で商品名と香りの名前を組んで合成
- 元データは 花森/生成画像 の シャンプー／トリートメント／入浴剤／ラベル の各フォルダ（ファイル名の末尾が色）

| シリーズ | ボトル・ジャー・袋の色 | ラベル |
| --- | --- | --- |
| Moon Garden | white | label_white |
| Forest Breath | green | label_green |
| Flower Field | lavender | label_lavender |
| Morning Dew | yellow | label_yellow |
| Mossy Rain | deepgreen | label_deepgreen |

## 以前のイラスト（*.svg）
- 使っていないが残してある。戻すときは js/data/products.js の `ext` を ".svg" にする

## スタイリング写真（*-styling.webp）
各香りのシャンプー・トリートメント・入浴剤の切り抜きを、セージ色の台の写真に合成したもの（800×1000）。
- 背景：Unsplash の無料写真（Unsplash License） https://images.unsplash.com/photo-1653398615646-c228b88e4ad4
