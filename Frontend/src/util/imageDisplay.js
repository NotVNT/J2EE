export const hasDisplayImage = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return false;
  }

  return /^(https?:\/\/|data:image\/|blob:|\/)/i.test(trimmedValue);
};

export const hideBrokenImageWrapper = (event) => {
  event.currentTarget.closest("[data-image-wrapper='true']")?.classList.add("hidden");
};
