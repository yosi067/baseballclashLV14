# Baseball Clash LV14 球員資料檢視器

這是一個使用 Vue 3 與 Vite 製作的 Baseball Clash LV14 球員資料檢視器。專案會讀取 `public/baseball crash LV14 - BCLV14.csv`，將打者與投手資料整理成可搜尋、篩選、排序與查看詳情的名單介面。

## 專案功能

- 顯示球員頭像、名稱、背號、位置、卡片等級與能力總和。
- 預設依背號由大到小排序，背號越大的球員排在越前面。
- 背號最大的球員會在列表中顯示醒目的 `New` 標籤。
- 可依球員名稱或位置搜尋。
- 可依卡片等級與位置篩選。
- 可切換排序欄位，支援背號、打擊、力量、跑速、球速、傳球、防守、控球、移動與旋轉。
- 點選球員後可查看詳細能力條、特殊技能與角色介紹。
- 支援桌面雙欄版面與手機單欄瀏覽。

## 規格內容

### 資料來源

- 主要資料檔案：`public/baseball crash LV14 - BCLV14.csv`
- 角色圖片路徑：`public/images/characters/`
- CSV 內含兩段資料：
	- 打者資料，包含擊球、力量、跑速、傳球、防守。
	- 投手資料，包含控球、球速、移動、旋轉。

### 球員欄位

系統會將 CSV 欄位整理成前端使用的角色資料：

- `JerseyNumber`：背號，來自 CSV 的 `背號` 欄位。
- `Name`：球員名稱。
- `Position`：位置。
- `Level`：卡片等級。
- `Average`：能力總和平均。
- `Type`：資料類型，分為 `Batter` 或 `Pitcher`。
- `Stats`：依角色類型整理出的能力列表。
- `Skill`：特殊技能。
- `Introduction`：角色介紹。

### 清單排序規則

- 角色列表預設以 `JerseyNumber` 由大到小排序。
- 使用者切換其他排序欄位時，仍預設使用由大到小排序。
- 若角色缺少目前排序欄位，會以較低順位處理。

### New 標籤規則

- 系統會計算所有角色中的最大背號。
- 背號等於最大背號的角色會在列表名稱旁顯示 `New`。

## 安裝與執行

請先安裝 Node.js，再於專案根目錄執行：

```bash
npm install
npm run dev
```

開發伺服器啟動後，可依終端機顯示的本機網址開啟專案。

## 建置

```bash
npm run build
```

建置完成後，輸出檔案會產生在 `dist/`。

## GitHub Pages 部署

專案已加入 GitHub Actions workflow：`.github/workflows/deploy-pages.yml`。

- 推送到 `main` 分支時會自動執行部署。
- GitHub Actions 會使用 `npm ci` 安裝依賴，執行 `npm run build`，並將 `dist/` 發佈到 GitHub Pages。
- 之後只要更新 CSV 或 `public/images/characters/` 內的角色 jpeg，並推送到 `main`，GitHub Pages 就會重新建置公開網頁。
- Repository 的 GitHub Pages 來源需設定為 `GitHub Actions`，讓部署由此 workflow 管理。

首次設定 GitHub Pages 時，請到 repository 的 `Settings` > `Pages`，在 `Build and deployment` 將 `Source` 改為 `GitHub Actions`。完成後，`main` 分支每次推送都會觸發此 workflow。

## 專案結構

```text
.github/workflows/
	deploy-pages.yml
public/
	baseball crash LV14 - BCLV14.csv
	images/characters/
src/
	App.vue
	main.js
	style.css
	components/
		CharacterDetail.vue
		CharacterList.vue
	composables/
		useCharacters.js
```
