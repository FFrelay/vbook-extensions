# 69shuba.com DOM Structure Analysis

## Page URL
`https://www.69shuba.com/book/51434.htm`

## Main Container Structure
```
<div class="container">
  <ul class="row">
    <li class="col-8">
      <!-- Main content (left column) -->
    </li>
    <li class="col-4">
      <!-- Sidebar (right column) -->
    </li>
  </ul>
</div>
```

---

## DETAIL PAGE STRUCTURE (`detail.js`)

### Book Information Container
```html
<div class="mybox">
  <div class="bookbox">
    <!-- Book cover -->
    <div class="bookimg2">
      <img src="https://cdn.cdnshu.com/files/article/image/51/51434/51434s.jpg" 
           title="玄鉴仙族" 
           alt="玄鉴仙族">
    </div>

    <!-- Book details -->
    <div class="booknav2">
      <h1>
        <a href="https://www.69shuba.com/book/51434.htm">玄鉴仙族</a>
      </h1>
      
      <!-- Author -->
      <p>作者：<a href="https://www.69shuba.com/modules/article/author.php?author=季越人" 
                 title="季越人" 
                 target="_blank">季越人</a></p>
      
      <!-- Category -->
      <p>分类：<a href="https://www.69shuba.com/novels/class/2.htm" 
               title="修真武侠" 
               target="_blank">修真武侠</a></p>
      
      <!-- Status and update info -->
      <p>568.16万字 | 连载</p>
      <p>更新：2026-05-08</p>
    </div>

    <!-- Action buttons -->
    <div class="addbtn">
      <a class="btn" href="https://www.69shuba.com/book/51434/">开始阅读</a>
      <a class="btn" id="a_addbookcase" href="javascript:;" onclick="addbookcase(51434,0);">加入书架</a>
      <a id="bookcase" href="/txt/51434/40557186" class="btn white" style="display: block;">进入书签</a>
    </div>
  </div>
</div>
```

### Recommended Selectors for `detail.js`:
```javascript
// Title
doc.select("div.booknav2 > h1 > a").text()
// → "玄鉴仙族"

// Cover image
doc.select("div.bookimg2 > img").attr("src")
// → "https://cdn.cdnshu.com/files/article/image/51/51434/51434s.jpg"

// Author (with cleanup)
doc.select("div.booknav2 > p:nth-child(2) > a").text().trim()
// → "季越人"

// Category
doc.select("div.booknav2 > p:nth-child(3) > a").text().trim()
// → "修真武侠"

// Description (from meta tag)
doc.select("meta[property='og:description']").attr("content")
// → "陆江仙熬夜猝死，残魂却附在了一面满是裂痕的青灰色铜镜上，飘落到了浩瀚无垠的修仙世界。..."
```

---

## TOC (Table of Contents) STRUCTURE (`toc.js`)

### Chapter List Container
```html
<div class="mybox">
  <ul class="tabs2 clearfix">
    <li class="active">
      <a href="javascript:;">
        <i class="iconfont icon-list"></i>
        目录
      </a>
    </li>
    <li>
      <a href="javascript:;">
        <i class="iconfont icon-Info"></i>
        简介
      </a>
    </li>
  </ul>

  <div class="tabsnav">
    <div>
      <!-- CHAPTER LIST -->
      <div class="qustime" data-eid="0">
        <ul>
          <li data-etime="2026-05-08">
            <a href="https://www.69shuba.com/txt/51434/41057508">
              <span>中奖名单</span>
              <small>2026-05-08</small>
            </a>
          </li>

          <li data-etime="2026-05-08">
            <a href="https://www.69shuba.com/txt/51434/41057507">
              <span>第1481章 天册（112）（感谢支持</span>
              <small>2026-05-08</small>
            </a>
          </li>

          <li data-etime="2026-05-07">
            <a href="https://www.69shuba.com/txt/51434/41057089">
              <span>谢谢大家and番外</span>
              <small>2026-05-07</small>
            </a>
          </li>

          <li data-etime="2026-05-07">
            <a href="https://www.69shuba.com/txt/51434/41057084">
              <span>第1480章 楼台（112）</span>
              <small>2026-05-07</small>
            </a>
          </li>

          <li data-etime="2026-05-06">
            <a href="https://www.69shuba.com/txt/51434/41056666">
              <span>第1479章 界中</span>
              <small>2026-05-06</small>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- DESCRIPTION PANEL (hidden by default) -->
    <div style="display: none;">
      <ul class="infolist">
        <li>568.16万字<span>字数</span></li>
        <li>1558<span>章节数</span></li>
      </ul>
      <div class="navtxt">
        <p>陆江仙熬夜猝死，残魂却附在了一面满是裂痕的青灰色铜镜上...</p>
      </div>
    </div>
  </div>

  <a class="btn more-btn" href="https://www.69shuba.com/book/51434/">完整目录</a>
</div>
```

### Recommended Selectors for `toc.js`:
```javascript
// Get all chapter links
doc.select("div.qustime > ul > li > a")

// For each chapter:
// Chapter name
el.select("span").text()
// → "中奖名单" or "第1481章 天册（112）（感谢支持"

// Chapter URL
el.attr("href")
// → "https://www.69shuba.com/txt/51434/41057508"

// Chapter date (bonus info)
el.select("small").text()
// → "2026-05-08"

// Parent li data attribute (for reference)
el.parentElement.attr("data-etime")
// → "2026-05-08"
```

---

## CHAPTER CONTENT STRUCTURE (`chap.js`)

**Note:** The provided HTML file only shows the book detail page. The chapter content page typically has this structure:

```html
<div class="txtnav">
  <!-- Removed: ads, comments, info sections -->
  <div class="content" id="content">
    <!-- Chapter content here -->
  </div>
</div>
```

### Expected Selectors for `chap.js`:
```javascript
// Main content container
doc.select(".txtnav #content")
// or
doc.select(".content")

// Remove unwanted elements BEFORE extracting:
doc.select(".contentadv").remove()      // Ads
doc.select(".bottom-ad").remove()       // Bottom ads
doc.select(".txtinfo").remove()         // Info box
doc.select("#txtright").remove()        // Right sidebar
doc.select("h1").remove()               // Chapter title (if duplicated)

// Get clean HTML
let htm = doc.select(".txtnav").html()
```

---

## HOME PAGE / GENRE LIST STRUCTURE (`gen.js`)

### Article List Item Structure
```html
<li class="list-item">
  <!-- Book thumbnail section -->
  <div class="newnav">
    <h3>
      <a class="not-class-selector" href="/book/51434.htm">
        玄鉴仙族
      </a>
    </h3>
  </div>

  <!-- Book cover image -->
  <a class="imgbox" href="/book/51434.htm">
    <img src="https://cdn.cdnshu.com/files/article/image/51/51434/51434s.jpg" 
         data-src="https://cdn.cdnshu.com/files/article/image/51/51434/51434s.jpg"
         alt="玄鉴仙族">
  </a>

  <!-- Description -->
  <div class="ellipsis_2">
    陆江仙熬夜猝死，残魂却附在了一面满是裂痕的青灰色铜镜上...
  </div>
</li>
```

### Recommended Selectors for `gen.js`:
```javascript
// Get all book items
let items = doc.select("ul#article_list_content li")
// or
let items = doc.select(".list-item")

// For each item:
// Title
el.select(".newnav h3 > a:not([class])").text()
// → "玄鉴仙族"

// Link
el.select("h3 > a").attr("href")
// → "/book/51434.htm"

// Cover image
el.select("a.imgbox > img").attr("data-src")
// → "https://cdn.cdnshu.com/files/article/image/51/51434/51434s.jpg"

// Description
el.select(".ellipsis_2").text()
// → "陆江仙熬夜猝死，残魂却附在了一面满是裂痕的青灰色铜镜上..."
```

---

## SIDEBAR STRUCTURE (Optional for Recommendations)

```html
<li class="col-4">
  <div class="mybox">
    <h3 class="mytitle">本周最强</h3>
    
    <ul class="tabs clearfix">
      <li class="active"><a href="javascript:;">热门</a></li>
      <li><a href="javascript:;">新书</a></li>
      <li><a href="javascript:;">完本</a></li>
    </ul>

    <div class="tabsnav">
      <div class="ranking" id="ranking_lianzai">
        <ul>
          <li>
            <a href="https://www.69shuba.com/book/37770.htm">
              <div class="rank_left">
                <h3 class="ranktit ellipsis_1">
                  <span></span>她是剑修
                </h3>
              </div>
              <div class="rank_right">
                <span>连载</span>
              </div>
            </a>
          </li>
          <!-- More books... -->
        </ul>
      </div>
    </div>
  </div>
</li>
```

---

## KEY NOTES FOR SELECTOR OPTIMIZATION

1. **Title**: Use `:not([class])` to exclude span elements
   - ✅ `.newnav h3 > a:not([class])`
   - ❌ `.newnav h3 > a` (might catch other elements)

2. **Cover Image**: Use `data-src` attribute (lazy loading)
   - ✅ `.imgbox > img` → `.attr("data-src")`
   - ❌ `.imgbox > img` → `.attr("src")` (might be placeholder)

3. **Description**: Uses ellipsis_2 class for truncation
   - Selector: `.ellipsis_2`

4. **List Items**: Can vary in class names
   - Try: `ul#article_list_content li`, `.list-item`, or generic `li`

5. **URL Handling**:
   - Relative URLs: `/book/51434.htm`
   - Always prepend BASE_URL: `https://www.69shuba.com` + link

6. **Encoding**: Page uses GBK encoding (important!)
   - Use: `response.html("gbk")` instead of default UTF-8

---

## File References
- **Detail page**: `/book/{id}.htm`
- **Chapter page**: `/txt/{id}/{chapter_id}`
- **Category page**: `/novels/class/{category_id}.htm`
- **Hot page**: `/novels/monthvisit_0_0_1.htm`
- **New releases**: `/novels/newhot_0_0_1.htm`
