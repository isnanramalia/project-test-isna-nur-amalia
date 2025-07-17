# Suitmedia Ideas Web Application

Aplikasi web responsive untuk menampilkan ide-ide dengan integrasi API, lazy loading, dan fitur UI modern.

## Demo & Repository

- **Live Demo:** [`https://isnanramalia.github.io/project-test-isna-nur-amalia`]
- **Repository:** [`https://gitlab.com/isnanramalia/project-test-isna-nur-amalia`]

## Fitur Utama

**Header Navigation**
- Fixed position dengan behavior hide/show saat scroll
- Active state sesuai halaman yang dikunjungi
- Mobile responsive dengan hamburger menu

**Banner**
- Parallax scrolling effect
- Diagonal bottom edge design
- Image system yang bisa diupdate via CMS

**Ideas Listing**
- Integrasi API dengan backend Suitmedia
- Sort berdasarkan newest/oldest
- Pagination dengan pilihan 10, 20, 50 items per page
- State persistence menggunakan URL parameters
- Lazy loading untuk gambar
- Title truncation maksimal 3 baris dengan ellipsis

**Interactive Features**
- Modal popup untuk detail idea
- Responsive grid layout
- Loading states dan error handling

## Project Structure

```
├── index.html              # Halaman utama Ideas
├── about.html, services.html, work.html, careers.html, contact.html
├── assets/                 # Gambar dan icon
├── css/                    # Stylesheet modular
│   ├── main.css           # File import utama
│   ├── header.css, banner.css, components.css
│   └── responsive.css, animations.css
└── js/
    ├── NavigationComponent.js  # Logic header navigation
    ├── IdeasApp.js            # Controller aplikasi utama
    ├── UIRenderer.js          # Utility rendering UI
    └── main.js               # Inisialisasi aplikasi
```

## Cara Menjalankan

1. Clone repository
2. Jalankan local server:
   ```bash
   python -m http.server 8000
   # atau
   npx live-server
   ```
3. Buka `http://localhost:8000`

## API Integration

**Endpoint:** `https://suitmedia-backend.suitdev.com/api/ideas`

**Parameters:**
- `page[number]`: Nomor halaman
- `page[size]`: Jumlah item per halaman (10, 20, 50)
- `append[]`: `small_image`, `medium_image`
- `sort`: `published_at` (terlama) atau `-published_at` (terbaru)

**Contoh:**
```
/api/ideas?page[number]=1&page[size]=10&append[]=small_image&append[]=medium_image&sort=-published_at
```

## Technical Features

- **Vanilla JavaScript** - Tanpa framework untuk performa optimal
- **Intersection Observer** - Implementasi lazy loading
- **CSS Grid & Flexbox** - Layout responsive modern
- **URL State Management** - Maintain filter saat page refresh
- **Mobile-first Design** - Responsive di semua device

## Requirements yang Dipenuhi

- [x] Fixed header dengan scroll behavior
- [x] Banner dengan parallax effects
- [x] Integrasi API lengkap
- [x] Sort functionality (newest/oldest)
- [x] Pagination (10/20/50 per page)
- [x] State persistence saat refresh
- [x] Lazy loading images
- [x] 3-line title truncation
- [x] Responsive design
