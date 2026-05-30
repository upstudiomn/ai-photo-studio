# AI Photo Studio — Project Overview

## Project name
AI Photo Studio

## Main idea
AI Photo Studio is a Mongolia-focused ecommerce web platform where users upload photos, choose ready-made AI photo templates, generate enhanced or transformed images, download digital files, or order local printed products delivered to them.

## Core business model
The platform combines:

1. AI photo generation and editing
2. Template-based user experience
3. Digital file delivery
4. Local photo printing and delivery in Mongolia

## Primary customer value
Users do not need to write prompts or understand AI tools. They simply upload photos, choose a template, preview AI results, pay, and receive either a digital file or printed product.

## Main services
- Old photo restoration
- Black and white photo colorization
- Scratch, dust, stain, and damage removal
- AI studio portrait
- Family photo merge
- Couple portrait
- Kids storybook poster
- Pet portrait
- Product photo background upgrade
- A4/A3 premium print
- Gift print package

## Mongolia-specific positioning
This is not only an AI image website. It is a local AI photo gift and print fulfillment service.

Current English UI message:

> Restore photos. Create memories. Order premium prints.

Historical Mongolian localization idea can be kept for a later explicit localization task, not as the current visible UI source.

## Long-term goal
The current MVP starts with a safe mock provider and a verified preview-first local flow. Replicate is implemented behind a model validation guard for later live tests, and OpenAI remains a later provider option. Future upgrades can add premium image models, face consistency pipelines, upscalers, QPay, and more advanced print products.

## Current implementation status

- Public preview-first flow: implemented and Playwright-tested in local mode.
- Visible customer/admin UI: English cleanup complete.
- Local PostgreSQL + local uploads: implemented and tested for development/E2E.
- Supabase database/storage: supported but not primary for current local E2E.
- Supabase/local sync or dual-write: not planned.
- Confirmed orders: created only after preview results and checkout confirmation.
- Admin dashboard: implemented for status updates, notes, print queue, and template prompt editing.
- AI providers: mock is primary for local/no-credit tests; Replicate guard exists; Gemini paused; OpenAI planned later.
