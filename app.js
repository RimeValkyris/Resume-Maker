/* ---------------- STATE ---------------- */

const state = {
  template: "freshgrad",
  font: "default",
  pageSize: "letter",
  color: "#000000",
  skillsFormat: "sentence",
  skillsText: "",
  contact: {},
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  activities: [],
};

const FIELD_CONFIG = {
  education: [
    { key: "school", label: "School / University", placeholder: "University of the Philippines" },
    { key: "degree", label: "Degree", placeholder: "B.S. Computer Science" },
    { key: "location", label: "Location", placeholder: "Quezon City, PH" },
    { key: "start", label: "Start Date", placeholder: "Aug 2021" },
    { key: "end", label: "End Date", placeholder: "May 2025" },
    { key: "detail", label: "Details (GPA, honors, relevant coursework)", placeholder: "GPA: 3.8/4.0, Dean's Lister", textarea: true },
  ],
  experience: [
    { key: "role", label: "Job Title", placeholder: "Software Engineering Intern" },
    { key: "company", label: "Company", placeholder: "Acme Corp" },
    { key: "location", label: "Location", placeholder: "Manila, PH" },
    { key: "start", label: "Start Date", placeholder: "Jun 2024" },
    { key: "end", label: "End Date", placeholder: "Aug 2024" },
    { key: "bullets", label: "Highlights (one per line)", placeholder: "Built a feature that improved X by Y%\nCollaborated with a team of 5 engineers", textarea: true, bullets: true },
  ],
  projects: [
    { key: "name", label: "Project Name", placeholder: "Resume Builder" },
    { key: "tech", label: "Tech Used", placeholder: "React, Node.js, PostgreSQL" },
    { key: "link", label: "Link (optional)", placeholder: "github.com/you/project" },
    { key: "bullets", label: "Highlights (one per line)", placeholder: "Designed and shipped a full-stack app used by 100+ users", textarea: true, bullets: true },
  ],
  skills: [
    { key: "category", label: "Category", placeholder: "Programming Languages" },
    { key: "items", label: "Skills (comma separated)", placeholder: "JavaScript, Python, SQL" },
  ],
  certifications: [
    { key: "name", label: "Certification / Award", placeholder: "AWS Certified Cloud Practitioner" },
    { key: "issuer", label: "Issuer", placeholder: "Amazon Web Services" },
    { key: "date", label: "Date", placeholder: "Mar 2025" },
  ],
  activities: [
    { key: "org", label: "Organization", placeholder: "Google Developer Student Club" },
    { key: "role", label: "Role", placeholder: "Vice President" },
    { key: "date", label: "Date", placeholder: "2023 - 2024" },
    { key: "bullets", label: "Highlights (one per line)", textarea: true, bullets: true },
  ],
};

let idCounter = 0;
const uid = () => "item" + ++idCounter;

const FONT_STACKS = {
  default: "",
  arial: "Arial, Helvetica, sans-serif",
  calibri: '"Calibri Light", Calibri, "Segoe UI", sans-serif',
  helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  times: '"Times New Roman", Times, serif',
  georgia: "Georgia, 'Times New Roman', serif",
  garamond: '"EB Garamond", Garamond, "Times New Roman", serif',
  verdana: "Verdana, Geneva, sans-serif",
};

const PAGE_CSS = {
  letter: "letter",
  a4: "A4",
};

const PAGE_HEIGHT_PX = {
  letter: 1056,
  a4: 1123,
};

function shade(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ---------------- INIT ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  bindContactFields();
  bindSummary();
  bindTemplateChoice();
  bindPhotoUpload();
  bindAppearance();
  bindSkillsFormat();

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addItem(btn.dataset.add);
    });
  });

  document.getElementById("generateBtn").addEventListener("click", () => window.print());
  document.getElementById("downloadDocxBtn").addEventListener("click", downloadDocx);
  document.getElementById("clearBtn").addEventListener("click", clearAll);

  // seed one blank row per repeatable section so the form doesn't look empty
  addItem("education");
  addItem("experience");
  addItem("skills");

  renderPreview();
});

function bindContactFields() {
  const map = {
    c_name: "name",
    c_title: "title",
    c_email: "email",
    c_phone: "phone",
    c_location: "location",
    c_linkedin: "linkedin",
    c_website: "website",
  };
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => {
      state.contact[key] = el.value;
      renderPreview();
    });
  });
}

function bindSummary() {
  const el = document.getElementById("c_summary");
  el.addEventListener("input", () => {
    state.summary = el.value;
    renderPreview();
  });
}

function bindAppearance() {
  const fontSel = document.getElementById("a_font");
  const sizeSel = document.getElementById("a_pagesize");
  const colorInput = document.getElementById("a_color");
  const colorHex = document.getElementById("a_colorHex");

  fontSel.addEventListener("change", () => {
    state.font = fontSel.value;
    renderPreview();
  });

  sizeSel.addEventListener("change", () => {
    state.pageSize = sizeSel.value;
    applyPrintPageSize();
    renderPreview();
  });

  colorInput.addEventListener("input", () => {
    state.color = colorInput.value;
    colorHex.textContent = colorInput.value.toUpperCase();
    renderPreview();
  });

  applyPrintPageSize();
}

function applyPrintPageSize() {
  let styleEl = document.getElementById("dynamicPageStyle");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "dynamicPageStyle";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `@page { size: ${PAGE_CSS[state.pageSize] || "letter"}; margin: 0; }`;
}

function bindSkillsFormat() {
  document.querySelectorAll('input[name="skillsFormat"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        state.skillsFormat = radio.value;
        applySkillsFormUI();
        renderPreview();
      }
    });
  });

  const sentenceInput = document.getElementById("skillsSentence");
  sentenceInput.addEventListener("input", () => {
    state.skillsText = sentenceInput.value;
    renderPreview();
  });

  applySkillsFormUI();
}

function applySkillsFormUI() {
  const isSentence = state.skillsFormat === "sentence";
  document.getElementById("skillsSentenceWrap").style.display = isSentence ? "block" : "none";
  document.getElementById("skillsList").style.display = isSentence ? "none" : "flex";
  document.getElementById("skillsAddBtn").style.display = isSentence ? "none" : "inline-block";
}

function bindPhotoUpload() {
  const input = document.getElementById("c_photo");
  const removeBtn = document.getElementById("removePhotoBtn");

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.contact.photo = reader.result;
      updatePhotoThumb();
      renderPreview();
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener("click", () => {
    state.contact.photo = "";
    input.value = "";
    updatePhotoThumb();
    renderPreview();
  });
}

function updatePhotoThumb() {
  const img = document.getElementById("photoPreview");
  const placeholder = document.getElementById("photoPlaceholder");
  const removeBtn = document.getElementById("removePhotoBtn");
  if (state.contact.photo) {
    img.src = state.contact.photo;
    img.style.display = "block";
    placeholder.style.display = "none";
    removeBtn.style.display = "inline-block";
  } else {
    img.style.display = "none";
    placeholder.style.display = "block";
    removeBtn.style.display = "none";
  }
}

function bindTemplateChoice() {
  const labels = {
    freshgrad: "Fresh Grad Template",
    intern: "Internship / OJT Template",
    harvard: "Harvard Template",
  };
  document.querySelectorAll('input[name="template"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        state.template = radio.value;
        document.getElementById("templateLabel").textContent = labels[radio.value];
        renderPreview();
      }
    });
  });
}

/* ---------------- REPEATABLE ITEMS ---------------- */

function addItem(type) {
  const item = { id: uid() };
  FIELD_CONFIG[type].forEach((f) => (item[f.key] = ""));
  state[type].push(item);
  renderList(type);
  renderPreview();
}

function removeItem(type, id) {
  state[type] = state[type].filter((i) => i.id !== id);
  renderList(type);
  renderPreview();
}

function renderList(type) {
  const container = document.getElementById(type + "List");
  container.innerHTML = "";
  state[type].forEach((item) => {
    const card = document.createElement("div");
    card.className = "repeat-item";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeItem(type, item.id));
    card.appendChild(removeBtn);

    FIELD_CONFIG[type].forEach((f) => {
      const field = document.createElement("div");
      field.className = "field" + (f.bullets ? " bullets-field" : "");

      const label = document.createElement("label");
      label.textContent = f.label;
      field.appendChild(label);

      const input = document.createElement(f.textarea ? "textarea" : "input");
      input.placeholder = f.placeholder || "";
      input.value = item[f.key] || "";
      if (f.textarea) input.rows = f.bullets ? 3 : 2;
      input.addEventListener("input", () => {
        item[f.key] = input.value;
        renderPreview();
      });
      field.appendChild(input);

      if (f.bullets) {
        const hint = document.createElement("div");
        hint.className = "bullets-hint";
        hint.textContent = "Tip: each line becomes a bullet point.";
        field.appendChild(hint);
      }

      card.appendChild(field);
    });

    container.appendChild(card);
  });
}

function clearAll() {
  if (!confirm("Clear all resume data? This cannot be undone.")) return;
  document.querySelectorAll(".form-panel input, .form-panel textarea").forEach((el) => (el.value = ""));
  state.contact = {};
  state.summary = "";
  state.skillsText = "";
  ["education", "experience", "projects", "skills", "certifications", "activities"].forEach((t) => {
    state[t] = [];
    renderList(t);
  });
  renderPreview();
}

/* ---------------- PREVIEW RENDERING ---------------- */

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function bulletsHtml(text) {
  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return "";
  return `<ul class="r-bullets">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
}

function renderPreview() {
  const page = document.getElementById("resumePreview");
  page.className = `resume-page tpl-${state.template} size-${state.pageSize}`;
  page.style.fontFamily = FONT_STACKS[state.font] || "";
  page.style.setProperty("--accent", state.color);
  page.style.setProperty("--accent-dark", shade(state.color, -18));

  const c = state.contact;
  const contactBits = [c.email, c.phone, c.location, c.linkedin, c.website].filter(Boolean);

  const photoHtml = c.photo ? `<img class="r-photo" src="${c.photo}" alt="Profile photo" />` : "";

  let html = `
    <div class="r-header">
      <div class="r-header-text">
        <p class="r-name">${esc(c.name) || "Your Name"}</p>
        <p class="r-title">${esc(c.title) || ""}</p>
        <div class="r-contact-line">${contactBits.map((b) => `<span>${esc(b)}</span>`).join("")}</div>
      </div>
      ${photoHtml}
    </div>
  `;

  if (state.summary) {
    html += section("Summary", `<p class="r-summary">${esc(state.summary)}</p>`);
  }

  if (state.education.length) {
    html += section(
      "Education",
      state.education
        .map(
          (e) => `
        <div class="r-entry">
          <div class="r-entry-row">
            <span class="r-entry-title">${esc(e.school)}${e.location ? ` <span class="r-entry-sub">— ${esc(e.location)}</span>` : ""}</span>
            <span class="r-entry-date">${esc(e.start)}${e.start || e.end ? " – " : ""}${esc(e.end)}</span>
          </div>
          <div class="r-entry-sub">${esc(e.degree)}</div>
          ${e.detail ? bulletsHtml(e.detail) : ""}
        </div>`
        )
        .join("")
    );
  }

  if (state.experience.length) {
    html += section(
      "Experience",
      state.experience
        .map(
          (e) => `
        <div class="r-entry">
          <div class="r-entry-row">
            <span class="r-entry-title">${esc(e.role)}${e.company ? ` — ${esc(e.company)}` : ""}</span>
            <span class="r-entry-date">${esc(e.start)}${e.start || e.end ? " – " : ""}${esc(e.end)}</span>
          </div>
          <div class="r-entry-sub">${esc(e.location)}</div>
          ${bulletsHtml(e.bullets)}
        </div>`
        )
        .join("")
    );
  }

  if (state.projects.length) {
    html += section(
      "Projects",
      state.projects
        .map(
          (p) => `
        <div class="r-entry">
          <div class="r-entry-row">
            <span class="r-entry-title">${esc(p.name)}</span>
            <span class="r-entry-date">${esc(p.link)}</span>
          </div>
          <div class="r-entry-sub">${esc(p.tech)}</div>
          ${bulletsHtml(p.bullets)}
        </div>`
        )
        .join("")
    );
  }

  const skillsHtml =
    state.skillsFormat === "sentence"
      ? state.skillsText.trim()
        ? `<p class="r-summary">${esc(state.skillsText.trim())}</p>`
        : ""
      : renderSkills(state.skills);
  if (skillsHtml) {
    html += section("Skills", skillsHtml);
  }

  if (state.certifications.length) {
    html += section(
      "Certifications & Awards",
      state.certifications
        .map(
          (c2) => `
        <div class="r-entry">
          <div class="r-entry-row">
            <span class="r-entry-title">${esc(c2.name)}${c2.issuer ? ` — ${esc(c2.issuer)}` : ""}</span>
            <span class="r-entry-date">${esc(c2.date)}</span>
          </div>
        </div>`
        )
        .join("")
    );
  }

  if (state.activities.length) {
    html += section(
      "Activities & Leadership",
      state.activities
        .map(
          (a) => `
        <div class="r-entry">
          <div class="r-entry-row">
            <span class="r-entry-title">${esc(a.role)}${a.org ? ` — ${esc(a.org)}` : ""}</span>
            <span class="r-entry-date">${esc(a.date)}</span>
          </div>
          ${bulletsHtml(a.bullets)}
        </div>`
        )
        .join("")
    );
  }

  page.innerHTML = html;
  requestAnimationFrame(updatePageCount);
}

function updatePageCount() {
  const page = document.getElementById("resumePreview");
  const label = document.getElementById("pageCountLabel");
  if (!page || !label) return;
  const pageHeight = PAGE_HEIGHT_PX[state.pageSize] || PAGE_HEIGHT_PX.letter;
  const pages = Math.max(1, Math.ceil(page.scrollHeight / pageHeight));
  label.textContent =
    pages > 1
      ? `${pages} pages — content overflows onto page ${pages} automatically`
      : "1 page";
}

function renderSkills(skills) {
  const valid = skills.filter((s) => (s.category || "").trim() || (s.items || "").trim());
  if (!valid.length) return "";
  return valid
    .map((s) => `<p class="r-skills-line"><strong>${esc(s.category)}${s.category ? ": " : ""}</strong>${esc(s.items)}</p>`)
    .join("");
}

function section(title, innerHtml) {
  return `
    <div class="r-section">
      <p class="r-section-title">${esc(title)}</p>
      ${innerHtml}
    </div>
  `;
}

/* ---------------- DOCX EXPORT ---------------- */

const DOCX_FONTS = {
  arial: "Arial",
  calibri: "Calibri",
  helvetica: "Helvetica",
  times: "Times New Roman",
  georgia: "Georgia",
  garamond: "EB Garamond",
  verdana: "Verdana",
};

const DOCX_PAGE_SIZE = {
  letter: { width: 12240, height: 15840 },
  a4: { width: 11906, height: 16838 },
};

const DOCX_MARGIN = 720; // 0.5in

function getDocxFont() {
  if (state.font !== "default" && DOCX_FONTS[state.font]) return DOCX_FONTS[state.font];
  return state.template === "harvard" ? "Times New Roman" : "Calibri";
}

function docxAccentColor() {
  return (state.color || "#000000").replace("#", "").toUpperCase();
}

async function dataUrlToImage(dataUrl) {
  const match = /^data:image\/(png|jpe?g|gif|bmp);base64,/.exec(dataUrl || "");
  if (!match) return null;
  const type = match[1] === "jpeg" ? "jpg" : match[1];
  const res = await fetch(dataUrl);
  const buf = await res.arrayBuffer();
  return { data: new Uint8Array(buf), type };
}

function docxLines(text) {
  return (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
}

function docxHeading(text) {
  const { Paragraph, TextRun, BorderStyle } = docx;
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: docxAccentColor(), space: 2 } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: docxAccentColor(), font: getDocxFont() }),
    ],
  });
}

function docxTitleDateRow(title, date, tabPos) {
  const { Paragraph, TextRun, TabStopType } = docx;
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: tabPos }],
    spacing: { after: 20 },
    keepNext: true,
    keepLines: true,
    children: [
      new TextRun({ text: title || "", bold: true, size: 21, font: getDocxFont() }),
      new TextRun({ text: date ? `\t${date}` : "", size: 20, font: getDocxFont() }),
    ],
  });
}

function docxSubLine(text) {
  const { Paragraph, TextRun } = docx;
  if (!text) return null;
  return new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({ text, italics: true, size: 20, color: "555555", font: getDocxFont() })],
  });
}

function docxBullets(text) {
  const { Paragraph, TextRun } = docx;
  return docxLines(text).map(
    (line) =>
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 20 },
        children: [new TextRun({ text: line, size: 20, font: getDocxFont() })],
      })
  );
}

async function downloadDocx() {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun } = docx;
  const font = getDocxFont();
  const accent = docxAccentColor();
  const page = DOCX_PAGE_SIZE[state.pageSize] || DOCX_PAGE_SIZE.letter;
  const tabPos = page.width - DOCX_MARGIN * 2;

  const c = state.contact;
  const contactBits = [c.email, c.phone, c.location, c.linkedin, c.website].filter(Boolean);

  const children = [];

  const nameRun = new TextRun({ text: c.name || "Your Name", bold: true, size: 40, color: accent, font });
  const headerChildren = [nameRun];

  if (c.photo) {
    const img = await dataUrlToImage(c.photo);
    if (img) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new ImageRun({ data: img.data, type: img.type, transformation: { width: 80, height: 80 } })],
        })
      );
    }
  }

  children.push(new Paragraph({ children: headerChildren, spacing: { after: 40 } }));

  if (c.title) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: c.title, size: 24, color: "444444", font })],
      })
    );
  }

  if (contactBits.length) {
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({ text: contactBits.join("   |   "), size: 18, color: "555555", font })],
      })
    );
  }

  if (state.summary) {
    children.push(docxHeading("Summary"));
    children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: state.summary, size: 20, font })] }));
  }

  if (state.education.length) {
    children.push(docxHeading("Education"));
    state.education.forEach((e) => {
      const title = e.school + (e.location ? `  —  ${e.location}` : "");
      const date = [e.start, e.end].filter(Boolean).join(" – ");
      children.push(docxTitleDateRow(title, date, tabPos));
      const sub = docxSubLine(e.degree);
      if (sub) children.push(sub);
      children.push(...docxBullets(e.detail));
    });
  }

  if (state.experience.length) {
    children.push(docxHeading("Experience"));
    state.experience.forEach((e) => {
      const title = e.role + (e.company ? `  —  ${e.company}` : "");
      const date = [e.start, e.end].filter(Boolean).join(" – ");
      children.push(docxTitleDateRow(title, date, tabPos));
      const sub = docxSubLine(e.location);
      if (sub) children.push(sub);
      children.push(...docxBullets(e.bullets));
    });
  }

  if (state.projects.length) {
    children.push(docxHeading("Projects"));
    state.projects.forEach((p) => {
      children.push(docxTitleDateRow(p.name, p.link, tabPos));
      const sub = docxSubLine(p.tech);
      if (sub) children.push(sub);
      children.push(...docxBullets(p.bullets));
    });
  }

  const hasSkills =
    state.skillsFormat === "sentence" ? state.skillsText.trim() : state.skills.some((s) => (s.category || "").trim() || (s.items || "").trim());
  if (hasSkills) {
    children.push(docxHeading("Skills"));
    if (state.skillsFormat === "sentence") {
      children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: state.skillsText.trim(), size: 20, font })] }));
    } else {
      state.skills
        .filter((s) => (s.category || "").trim() || (s.items || "").trim())
        .forEach((s) => {
          children.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({ text: s.category ? `${s.category}: ` : "", bold: true, size: 20, font }),
                new TextRun({ text: s.items || "", size: 20, font }),
              ],
            })
          );
        });
    }
  }

  if (state.certifications.length) {
    children.push(docxHeading("Certifications & Awards"));
    state.certifications.forEach((c2) => {
      const title = c2.name + (c2.issuer ? `  —  ${c2.issuer}` : "");
      children.push(docxTitleDateRow(title, c2.date, tabPos));
    });
  }

  if (state.activities.length) {
    children.push(docxHeading("Activities & Leadership"));
    state.activities.forEach((a) => {
      const title = a.role + (a.org ? `  —  ${a.org}` : "");
      children.push(docxTitleDateRow(title, a.date, tabPos));
      children.push(...docxBullets(a.bullets));
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: page.width, height: page.height },
            margin: { top: DOCX_MARGIN, bottom: DOCX_MARGIN, left: DOCX_MARGIN, right: DOCX_MARGIN },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${(c.name || "Resume").trim().replace(/[^a-z0-9]+/gi, "_")}.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
