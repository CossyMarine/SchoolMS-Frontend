// src/utils/routeForUser.js
export function routeForUser(user) {
  if (!user) return "/login";
  switch (user.role) {
    case "admin":
      return "/admin";
    case "moderator":
      return "/moderator";
    case "teacher":
      return "/teacher";
    case "librarian":
      return "/librarian";
    case "parent":
    case "student":
      return "/portal";
    default:
      return "/login";
  }
}
