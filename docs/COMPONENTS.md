# Litoho Components

คู่มือนี้อธิบาย pattern หลักของการเขียน Lit components ใน Litoho โดยใช้ convention `src/components` และ CLI ของ framework

## แนวคิดหลัก

Litoho แยกความรับผิดชอบประมาณนี้:

- `app/pages/**` เป็น route modules ของ framework
- `app/api/**` เป็น backend handlers
- `src/components/**` เป็น Lit components ของแอป
- `@litoho/ui` เป็น shared UI primitives สำเร็จรูป

ถ้าคุณกำลังสร้าง component ที่เป็น business UI ของแอปตัวเอง ให้เริ่มที่ `src/components`

## Quick Start

สร้าง component ใหม่:

```bash
pnpm exec litoho g c hero/banner
```

สร้าง component แล้ว import เข้า page ให้อัตโนมัติ:

```bash
pnpm exec litoho g c hero/banner --page profile/card
```

หรือถ้าอยากใช้ path เดียวกับ page เลย:

```bash
pnpm exec litoho g c --page profile/card
```

สร้าง component พร้อม compose กับ `@litoho/ui` ตั้งแต่เริ่ม:

```bash
pnpm exec litoho g c profile/card --with-ui button,card
```

คำสั่งสุดท้ายจะสร้าง:

```text
src/components/profile/card.ts
```

และเพิ่ม import เข้า:

```text
app/pages/profile/card/_index.ts
```

พร้อมแทรก usage snippet ลงใน `render()` ของ page ให้อัตโนมัติด้วย

## โครงสร้างที่แนะนำ

ตัวอย่าง:

```text
src/
  components/
    marketing/
      hero.ts
    products/
      product-card.ts
app/
  pages/
    _index.ts
    products/
      _index.ts
```

แนวทางตั้งชื่อ:

- ใช้ชื่อไฟล์ตามหน้าที่จริง เช่น `hero.ts`, `product-card.ts`, `pricing-table.ts`
- ถ้าอยู่ใน folder แล้วไม่จำเป็นต้องซ้ำชื่อ parent เช่น `src/components/profile/card.ts` ดีกว่า `src/components/profile/profile-card.ts`
- custom element จะถูก generate เป็น kebab-case ให้อัตโนมัติ เช่น `app-profile-card`

## Component ที่ scaffold มาให้

CLI จะสร้าง component ที่:

- extend จาก `LitoElement`
- ใช้ `html` และ `css` จาก `lit`
- register ตัวเองผ่าน `defineComponent()`
- มี `slot` ไว้ให้ compose ต่อได้
- ถ้าใช้ `--with-ui` จะ import UI modules ที่ต้องใช้และ scaffold markup ชุดแรกให้เลย

ตัวอย่าง:

```ts
import { css, html } from "lit";
import { LitoElement, defineComponent } from "@litoho/core";

export class ProfileCard extends LitoElement {
  static properties = {
    title: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }
  `;

  declare title: string;

  constructor() {
    super();
    this.title = "Profile Card";
  }

  render() {
    return html`
      <section>
        <h2>${this.title}</h2>
        <slot></slot>
      </section>
    `;
  }
}

defineComponent("app-profile-card", ProfileCard);
```

## ใช้งานใน Page

เมื่อ component ถูก import แล้ว คุณสามารถใช้ tag ได้ตรง ๆ ใน route module:

```ts
import "../../../src/components/profile/card.ts";
import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";

const page: LitoPageModule = {
  document: {
    title: "Profile"
  },
  render: () => html`
    <main>
      <app-profile-card title="Team Profile">
        <p>This card comes from src/components.</p>
      </app-profile-card>
    </main>
  `
};

export default page;
```

## ใช้ State ใน Component

ถ้าต้องการ local reactive state ให้ใช้ primitives จาก `@litoho/core`

```ts
import { css, html } from "lit";
import { LitoElement, defineComponent, memo, signal } from "@litoho/core";

const count = signal(0);
const doubled = memo(() => count.value * 2);

export class CounterPanel extends LitoElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <div>
        <p>Count: ${count.value}</p>
        <p>Doubled: ${doubled.value}</p>
        <button @click=${() => count.update((value) => value + 1)}>Increase</button>
      </div>
    `;
  }
}

defineComponent("app-counter-panel", CounterPanel);
```

สิ่งสำคัญ:

- การอ่าน `signal()` ใน `render()` จะ re-render ให้เอง
- event handlers เช่น `@click` ทำงานฝั่ง browser หลัง hydration
- ถ้า component ถูกใช้ใน `"use client"` page จะเหมาะกับ interactive UI มากที่สุด

## เรื่อง SSR และ `"use client"`

directive `"use client"` และ `"use server"` เป็นของ route modules ใน `app/pages/**`

โดยทั่วไป:

- page เป็นตัวตัดสินว่า route นี้เน้น client หรือ server
- component ใน `src/components/**` ควรเป็น reusable UI
- ถ้า component ใช้ browser APIs โดยตรง เช่น `window`, `localStorage`, `ResizeObserver` ควรใช้มันภายใน browser-safe paths เท่านั้น

ตัวอย่าง:

```ts
import { html } from "lit";
import type { LitoPageModule } from "@litoho/app";
import "../../../src/components/dashboard/live-chart.ts";

const page: LitoPageModule = {
  render: () => html`<app-live-chart></app-live-chart>`
};

export default page;
```

และ page นี้ควรมี `"use client";` ถ้า component มี interaction หรือใช้ browser runtime หนัก ๆ

## เมื่อไหร่ควรใช้ `@litoho/ui`

ใช้ `@litoho/ui` เมื่อคุณต้องการ primitive กลาง เช่น:

- button
- input
- dialog
- tabs
- toast

ใช้ `src/components` เมื่อคุณกำลังสร้าง:

- hero section
- product card
- profile panel
- dashboard widgets
- app-specific composed components

แนวทางที่ดีคือ compose ทั้งสองแบบร่วมกัน:

```ts
import "@litoho/ui/button";
import { html } from "lit";
import { LitoElement, defineComponent } from "@litoho/core";

export class PricingCard extends LitoElement {
  static properties = {
    plan: { type: String },
    price: { type: String }
  };

  declare plan: string;
  declare price: string;

  constructor() {
    super();
    this.plan = "Starter";
    this.price = "$19";
  }

  render() {
    return html`
      <article>
        <h3>${this.plan}</h3>
        <p>${this.price}</p>
        <lui-button>Choose plan</lui-button>
      </article>
    `;
  }
}

defineComponent("app-pricing-card", PricingCard);
```

## Pattern ที่แนะนำ

### 1. Presentational Component

ใช้เมื่อ component รับ props แล้ว render UI อย่างเดียว

- ง่าย
- reuse ได้สูง
- เทสง่าย

### 2. Stateful Widget

ใช้เมื่อ component มี local interactions เช่น:

- toggle
- counter
- inline filters
- tabs-like custom behavior

### 3. Composed Page Sections

ใช้ `src/components` แยก section ใหญ่ของ page เช่น:

- `marketing/hero.ts`
- `marketing/feature-grid.ts`
- `marketing/cta-strip.ts`

page route จะสะอาดขึ้นมาก และอ่านง่ายกว่า inline HTML ยาว ๆ

## ข้อแนะนำด้าน DX

- สร้าง component ผ่าน CLI ก่อน แล้วค่อยปรับโค้ด
- ถ้ารู้ว่าจะใช้กับ page ไหน ให้ใช้ `--page` ตั้งแต่แรก
- อย่าใส่ logic route-specific มากเกินไปใน reusable component
- อย่า import API route modules เข้า component ฝั่ง client
- ถ้า component เริ่มใหญ่เกินหนึ่งหน้าจอ ให้แตกย่อยเพิ่ม

## Commands ที่เกี่ยวข้อง

```bash
pnpm exec litoho g c hero/banner
pnpm exec litoho g c hero/banner --tag marketing-hero
pnpm exec litoho g c hero/banner --page landing
pnpm exec litoho g c --page profile/card
pnpm exec litoho g c profile/card --with-ui button,card
```

## สรุป

pattern ที่ง่ายและแนะนำที่สุดใน Litoho ตอนนี้คือ:

1. route อยู่ใน `app/pages`
2. reusable Lit components อยู่ใน `src/components`
3. ใช้ `@litoho/ui` เป็น shared primitives
4. ใช้ `litoho g c` เป็น entry point หลักสำหรับสร้าง component ใหม่
