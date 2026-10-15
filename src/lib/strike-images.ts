// Genererad: officiella produktbilder per stolpe (STEP via steplock.com, ASSA via återförsäljare; 1487-3 visar 1487-2:s bild – samma utförande).
export const STRIKE_IMAGES: Record<string, string> = {
  "1487-1.jpg": "/__l5e/assets-v1/31f338b1-4581-4090-993f-f5240cf31a71/1487-1.jpg",
  "1487-2.jpg": "/__l5e/assets-v1/358f8d24-9c41-4bf0-88c6-450faea8fa18/1487-2.jpg",
  "1487-3.jpg": "/__l5e/assets-v1/1f23323e-a265-4628-948c-99aa26ce117b/1487-3.jpg",
  "1487-4.jpg": "/__l5e/assets-v1/22a9d658-010c-4e05-9700-566cf042285e/1487-4.jpg",
  "ST4001-10.png": "/__l5e/assets-v1/73c1429f-b159-47b7-9a3b-bd44241fb4fa/ST4001-10.png",
  "ST4001-13.png": "/__l5e/assets-v1/a5875291-4d4f-412e-88d0-bf8475b8ffc6/ST4001-13.png",
  "ST4001-15.png": "/__l5e/assets-v1/7727eb3c-4519-49ac-966b-8defe7ece48c/ST4001-15.png",
  "ST4001-17.png": "/__l5e/assets-v1/98d0f2fa-2561-4643-b5c4-8cd364d5fee9/ST4001-17.png",
  "ST4001-20.png": "/__l5e/assets-v1/09bfb547-baa7-48ec-bd29-9c9ddc4c4df1/ST4001-20.png",
  "ST4001-26.png": "/__l5e/assets-v1/0abe4340-bcee-4500-a83d-495006dcfe63/ST4001-26.png",
  "ST4002-10.png": "/__l5e/assets-v1/363508aa-50ae-47e5-95e8-6f3409ea6ab3/ST4002-10.png",
  "ST4002-13.png": "/__l5e/assets-v1/8001b0ec-41b6-4815-8c2f-45614554e3ac/ST4002-13.png",
  "ST4002-15.png": "/__l5e/assets-v1/2a9de064-7c92-42ea-b5b6-8fd4b50afbfa/ST4002-15.png",
  "ST4002-17.png": "/__l5e/assets-v1/42e0a2be-5dd7-4bab-9666-7b06e21f9e6f/ST4002-17.png",
  "ST4003-12.png": "/__l5e/assets-v1/c344f6bc-c467-4df5-bf6f-227d544adf0e/ST4003-12.png",
  "ST4003-15.png": "/__l5e/assets-v1/91251785-141b-4bb7-aa30-23895c2a295e/ST4003-15.png",
  "ST4003-21.png": "/__l5e/assets-v1/3cf745af-7e6e-409b-a9e7-60ad66fe516f/ST4003-21.png",
  "ST4005-13.png": "/__l5e/assets-v1/0399f4f8-3ea8-4d4f-80fc-45de602df757/ST4005-13.png",
  "ST4005-15.png": "/__l5e/assets-v1/80b457f0-81c3-4a92-a260-6d55664a3b28/ST4005-15.png",
  "ST4005-20.png": "/__l5e/assets-v1/1d4875fa-45b8-4171-a738-6e21edf82e63/ST4005-20.png",
  "ST4005-21.png": "/__l5e/assets-v1/9ff32e69-68dc-4bdd-a06f-31e0506497c3/ST4005-21.png",
  "ST4009-13.png": "/__l5e/assets-v1/78a6d7d4-1001-4add-8bf8-576bb286cb7d/ST4009-13.png",
  "ST4009-16.png": "/__l5e/assets-v1/25a88e48-4858-4372-a597-f3ddbddfef38/ST4009-16.png",
  "ST4009-20.png": "/__l5e/assets-v1/8ed58c71-24b3-4389-a910-86eeb7786b46/ST4009-20.png",
  "ST4009-21.png": "/__l5e/assets-v1/d4732589-f9a7-4b80-b205-af21338fbaa9/ST4009-21.png"
};

export const strikeImage = (article: string): string | undefined => STRIKE_IMAGES[article];

export const strikeImageNote = (article: string): string | undefined =>
  article === "1487-3" ? "Bilden visar 1487-2 (samma utförande, annat plösmått)." : undefined;
