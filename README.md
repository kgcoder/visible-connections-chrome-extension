# Visible Connections — Chrome Extension

**View visible connections between web pages.**
Chrome Web Store: [https://chromewebstore.google.com/detail/visible-connections/hlckcdbgknflkkciojgdbhomdnegimbm](https://chromewebstore.google.com/detail/visible-connections/hlckcdbgknflkkciojgdbhomdnegimbm)

Visible Connections Chrome extension displays visible connections between web pages. The page that defines the connections needs to use one of the new data types from the **Default Web** project — the pages it connects to can be ordinary web pages.

Default Web specifications: [https://github.com/kgcoder/default-web](https://github.com/kgcoder/default-web)

---

## What This Extension Does

Visible Connections scans the current page for supported document types (HDOC, CDOC, CONDOC, Embedded HDOC, etc.) and displays the connections they define:

* links to sources
* commentary relationships
* references
* any other link structures supported by Default Web document types

It acts as a **viewer** for the growing ecosystem of static, connected documents.

Because browsers don’t yet support visible connections natively, this extension provides the missing functionality until native support is provided.

---

## How to Create Connected Pages

There are two main approaches:

### 1. Publish your own HDOCs or CDOCs

For example:

* A page that links to all its sources.
* A commentary or analysis of another page (even on another website).

### 2. Enhance existing content

You can add:

* a table of contents to a public-domain book
* maps
* references
* related documents

Then you publish a **connections document (CONDOC)** that links the original work with all the supplemental material.

### ⚠ Legal considerations

Connecting *your own* documents is always safe.
Connecting copyrighted content might create derivative works — commentary is usually safer than enhancement.

---

## Security and Safety

This extension bypasses cross-domain restrictions using a background script — but it is designed to be safe:

* **All scripts on the current page are disabled during processing.**
* **All scripts in connected pages are stripped before display.**
* **By default, the extension asks for confirmation** before downloading content from another domain.

If that confirmation becomes annoying, you can turn it off in the settings.

---

## Roadmap

The extension is currently a **viewer**.
Planned future work includes making it more writer-friendly,

Ultimately, if browsers adopt visible connections natively, this extension will no longer be necessary — which is the ideal outcome.

---

## Inspiration

Visible Connections is inspired by Ted Nelson’s decades-old vision of hypertext — concepts that the modern Web never implemented.
This project aims to bring some of those ideas to life, starting with visible connections between documents.

---

## Development

The code in this repository is licensed under MIT.

Document types used by this extension are part of the **Default Web project** and are licensed under **CC BY-ND 4.0**.

---

## Links

* **Chrome Web Store:**
  [https://chromewebstore.google.com/detail/visible-connections/hlckcdbgknflkkciojgdbhomdnegimbm](https://chromewebstore.google.com/detail/visible-connections/hlckcdbgknflkkciojgdbhomdnegimbm)

* **Default Web Specs:**
  [https://github.com/kgcoder/default-web](https://github.com/kgcoder/default-web)


