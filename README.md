<div align="center">

# SayCal

### 🗣️ Speak it. It's noted.

A minimalist calendar with voice-powered event creation.
Just say *"Dentist tomorrow at 2pm"* and the event is created automatically.

[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?style=flat-square&logo=react)](https://tanstack.com/start)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E5CC?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎤 **Voice Creation** | Dictate events in natural language — done in under 5 seconds |
| 🗓️ **Clean Interface** | Modern design with day/week/month views, no clutter |
| 📱 **Multi-Platform** | Responsive PWA, perfect on mobile and desktop |
| 🔓 **Open Source** | Transparent code, your data stays yours |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" width="48" height="48" alt="React" />
<br><sub><b>React 19</b></sub>
</td>
<td align="center" width="96">
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="48" height="48" alt="TypeScript" />
<br><sub><b>TypeScript</b></sub>
</td>
<td align="center" width="96">
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="48" height="48" alt="Tailwind" />
<br><sub><b>Tailwind CSS</b></sub>
</td>
<td align="center" width="96">
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Cloudflare-Dark.svg" width="48" height="48" alt="Cloudflare" />
<br><sub><b>Workers</b></sub>
</td>
<td align="center" width="96">
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" width="48" height="48" alt="PostgreSQL" />
<br><sub><b>Neon DB</b></sub>
</td>
</tr>
</table>

**Full stack:** TanStack Start • Drizzle ORM • shadcn/ui • Paraglide i18n • Deepgram STT • Gemini Flash

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/paul-bouzian/saycal.git
cd saycal

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Build for production |
| `bun run check` | Run Biome linter & formatter |
| `bun run test` | Run Vitest tests |
| `bun run deploy` | Deploy to Cloudflare Workers |
| `bun run db:push` | Push schema to Neon |
| `bun run db:generate` | Generate migration |
| `bun run db:studio` | Open Drizzle Studio |

---

## 📁 Project Structure

```
src/
├── routes/           # File-based routing (TanStack Router)
├── features/         # Feature-based components
├── components/ui/    # shadcn/ui components
├── db/               # Drizzle ORM schema
├── paraglide/        # i18n runtime (auto-generated)
└── lib/              # Utilities

messages/             # Translations (en, fr, de)
specs/                # Technical documentation
```

---

## 🎨 Design System

<table>
<tr>
<td align="center">
<img src="https://via.placeholder.com/80/B552D9/FFFFFF?text=+" alt="Primary" />
<br><code>#B552D9</code>
<br><sub>Primary</sub>
</td>
<td align="center">
<img src="https://via.placeholder.com/80/FA8485/FFFFFF?text=+" alt="Secondary" />
<br><code>#FA8485</code>
<br><sub>Secondary</sub>
</td>
<td align="center">
<img src="https://via.placeholder.com/160x80/B552D9/FA8485?text=Gradient" alt="Gradient" />
<br><code>135deg</code>
<br><sub>Brand Gradient</sub>
</td>
</tr>
</table>

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
VITE_DATABASE_URL=postgresql://...
VITE_DATABASE_URL_POOLER=postgresql://...

# AI Services
DEEPGRAM_API_KEY=your_deepgram_key
GEMINI_API_KEY=your_gemini_key

# Payments (optional)
STRIPE_SECRET_KEY=your_stripe_key
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Paul Bouzian](https://github.com/paul-bouzian)

</div>
