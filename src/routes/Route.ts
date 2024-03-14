import express from "express";
import multer from "multer";

import RoleController from "../controllers/RoleController";
import UserController from "../controllers/UserController";
import MasterMenuController from "../controllers/MasterMenuController";
import SubmenuController from "../controllers/SubMenuController";
import RoleMenuAccessController from "../controllers/RoleMenuAccessController";
import FileController from "../controllers/FileController";

import UserValidation from "../middleware/validation/UserValidation";
import Authorization from "../middleware/Authorization";
import MenuValidation from "../middleware/validation/MenuValidation";
import upload from "../middleware/Upload";

const router = express.Router();

router.get("/role", Authorization.Authenticated, RoleController.GetRole);
router.post("/role",Authorization.Authenticated, Authorization.AdminRole, RoleController.CreateRole);
router.post("/role/:id",Authorization.Authenticated, Authorization.AdminRole, RoleController.UpdateRole);
router.delete("/role/:id", Authorization.Authenticated, Authorization.SuperUser , RoleController.DeleteRole);
router.get("/role/:id",Authorization.Authenticated, RoleController.GetRoleById);


// User Routing
router.post("/user/signup", UserValidation.RegisterValidation, UserController.Register);
router.post("/user/login", UserController.UserLogin);
router.get("/user/refresh-token", UserController.RefreshToken);
router.get("/user/current-user", Authorization.Authenticated, UserController.UserDetail);
router.put("/user/update-user", Authorization.Authenticated, UserController.UserUpdate);
router.get("/user/logout", Authorization.Authenticated, UserController.UserLogout);
router.post("/user/upload", Authorization.Authenticated, upload.single('file'), FileController.uploadFile);

// Master Menu Routing
router.post("/menu", MenuValidation.CreateMenuValidation, Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.CreateMenu);
router.get("/menu", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.GetListMenu);
router.get("/menu/get/all", Authorization.Authenticated, Authorization.SuperUser, MasterMenuController.GetAllMenu);
router.get("/menu/:id", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.GetDetailMenu);
router.patch("/menu/:id", MenuValidation.CreateMenuValidation, Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.UpdateMenu);
router.delete("/menu/:id", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.SoftDeleteMenu);
router.delete("/menu/permanent/:id", Authorization.Authenticated, Authorization.SuperUser, MasterMenuController.DeletePermanent);

// Submenu routing
router.post("/sub-menu", MenuValidation.CreateSubmenuValidation, Authorization.Authenticated, Authorization.AdminRole, SubmenuController.CreateSubmenu);
router.get("/sub-menu", Authorization.Authenticated, Authorization.AdminRole, SubmenuController.GetListSubmenu);
router.get("/sub-menu/get/all", Authorization.Authenticated, Authorization.SuperUser, SubmenuController.GetAllSubmenu);
router.get("/sub-menu/:id", Authorization.Authenticated, Authorization.AdminRole, SubmenuController.GetDetailSubmenu);
router.patch("/sub-menu/:id", MenuValidation.CreateSubmenuValidation, Authorization.Authenticated, Authorization.AdminRole, SubmenuController.UpdateSubmenu);
router.delete("/sub-menu/:id", Authorization.Authenticated, Authorization.AdminRole, SubmenuController.SoftDelete);
router.delete("/sub-menu/permanent/:id", Authorization.Authenticated, Authorization.SuperUser, SubmenuController.DeletePermanent);

// Role Menu Access
router.post("/role-menu-access", MenuValidation.CreateRoleMenuAccess , Authorization.Authenticated, Authorization.SuperUser, RoleMenuAccessController.CreateAccess);
router.get("/role-menu-access", Authorization.Authenticated, Authorization.SuperUser, RoleMenuAccessController.GetList);
router.get("/role-menu-access/get/all", Authorization.Authenticated, Authorization.SuperUser, RoleMenuAccessController.GetAll);
router.get("/role-menu-access/:id", Authorization.Authenticated, Authorization.SuperUser, RoleMenuAccessController.GetDetail);
router.patch("/role-menu-access/:id", MenuValidation.CreateRoleMenuAccess, Authorization.Authenticated, Authorization.SuperUser, RoleMenuAccessController.UpdateAccess);
router.delete("/role-menu-access/:id", Authorization.Authenticated, Authorization.SuperUser, RoleMenuAccessController.SoftDelete);

export default router;