# 🚀 Rendetalje OS - Dual Environment Development Workflow

## 🎯 Optimal Strategi for Lokal + Codex Udvikling

### 🏠 **Lokalt (Claude + Cursor)**

**Brugt til:** Arkitektur, Database, Core Logic, Performance

**Ansvar:**

- 📊 Database design & Supabase migrations
- 🏗️ Core arkitektur (types.ts, hooks struktur)
- 🔧 Performance optimering (bundle size, loading states)
- 🐛 Debugging & fejlrettelse
- 📝 Git management (commit & push til sync)
- 🔒 Production-ready features

**Commands:**

```bash
npm run dev          # Start lokal server
npm run build        # Test production build
git add . && git commit -m "feature" && git push origin main
```

### ☁️ **Codex (OpenAI Cloud)**

**Brugt til:** Feature Development, UI/UX, Eksperimenter

**Ansvar:**

- 🆕 Nye komponenter (InventoryView, NotificationSystem)
- 🎨 UI/UX forbedringer (animationer, dark mode, responsive)
- 🧪 Prototyping & eksperimenter
- 📚 Testing nye biblioteker
- 🔄 Iterativ udvikling

**Commands:**

```bash
npm run dev              # Start udviklingsserver
git pull origin main    # Sync med lokale ændringer
git push origin feature-branch  # Push nye features
```

## 🔄 **Sync Process**

### **Step 1: Feature Planning (Lokalt)**

1. Design arkitektur og database ændringer
2. Skab types og interfaces
3. Planlæg komponent struktur
4. Commit og push til GitHub

### **Step 2: Development (Codex)**

1. Pull seneste ændringer
2. Udvikl nye komponenter
3. Test og iterer
4. Push til feature branch

### **Step 3: Integration (Lokalt)**

1. Pull fra feature branch
2. Test integration med database
3. Performance check
4. Merge til main og push

## 🎯 **Konkrete Use Cases**

### **Scenario 1: Lager Management System**

- **Lokalt:** Design inventory database tables, create useInventory hook
- **Codex:** Byg InventoryManagementView komponent med UI
- **Lokalt:** Test database integration, optimér performance

### **Scenario 2: Notifikation System**

- **Lokalt:** Design notification schema, webhook setup
- **Codex:** Byg NotificationCenter komponent med toast system
- **Lokalt:** Integrér med real-time database updates

### **Scenario 3: Mobile PWA**

- **Lokalt:** Konfigurér PWA manifest, service worker setup
- **Codex:** Optimér responsive design, touch gestures
- **Lokalt:** Test offline functionality, performance

## 📊 **Success Metrics**

- ⚡ Hurtigere udvikling gennem parallel arbejde
- 🎯 Højere code kvalitet gennem review process
- 🔄 Bedre eksperimentering uden at bryde production
- 📈 Mere features shipped per sprint

## 🛠️ **Tools Integration**

- **Git:** Central sync point mellem miljøer
- **GitHub:** Code review og feature branch management
- **Supabase:** Database migrations kun fra lokalt miljø
- **Vercel/Netlify:** Deploy kun fra main branch (lokalt approved)

---

**Sidste opdatering:** $(date)
**Miljøer:** Lokal (localhost:5174) + Codex Cloud (/workspace/rendetalje-os)
