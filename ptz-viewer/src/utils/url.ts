export const reload = () => window.location.reload();

// export const navigate = (app: string, branch: string, page: number) =>
export const navigate = () => {};
// window.location.replace(
//   `/${window.encodeURIComponent(app)}/${window.encodeURIComponent(
//     branch,
//   )}/${page}`,
// );

// const DEFAULT_APP = appSearchText.all;
// const DEFAULT_BRANCH = "master";
// const DEFAULT_PAGE = 0;

// const urlParts = window.location.pathname.slice(1).split("/");
// if (!urlParts[0] || !urlParts[1] || !urlParts[2] || urlParts.length !== 3) {
//   navigate(DEFAULT_APP, DEFAULT_BRANCH, DEFAULT_PAGE);
// }

// export const urlAppValue = window.decodeURIComponent(urlParts[0]);
// export const urlBranch = window.decodeURIComponent(urlParts[1]);
// export const urlPage = parseInt(urlParts[2], 10);
