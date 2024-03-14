import { Request, Response } from "express";
import { Op } from "sequelize";
import Role from "../db/models/Role";
import User from "../db/models/User";
import RoleMenuAccess from "../db/models/RoleMenuAccess";
import MasterMenu from "../db/models/MasterMenu";
import Submenu from "../db/models/SubMenu";
import { Serializer } from 'jsonapi-serializer';

import Helper from "../helper/Helper";
import PasswordHelper from "../helper/PasswordHelper";

const serialize = (data: User) => {
  const serializerSchema = ({
    id: 'id',
    attributes: [
      'name',
      'email',
	  'verified',
	  'active',
      'createdAt',
      'updatedAt',

      // relations start here
      'role'
    ],
    Role: {
      attributes: [
        'id',
        'roleName',
      ]
    },
    keyForAttribute: 'camelCase',
  });

  return new Serializer('Users', serializerSchema).serialize(data);
}

const Register = async (req: Request, res: Response): Promise<Response> => {
	try {
		const { name, email, password, confirmPassword } = req.body;

		const hashed = await PasswordHelper.PasswordHashing(password);

		const user = await User.create({
			name,
			email,
			password: hashed,
			active: true,
			verified: true,
			roleId: 3
		});

		return res.status(201).send(Helper.ResponseData(201, "Created", null, user));
	} catch (error: any) {
		return res.status(500).send(Helper.ResponseData(500, "", error, null));
	}
};

const UserLogin = async (req: Request, res: Response): Promise<Response> => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({
			where: {
				email: email
			}
		});

		if (!user) {
			return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
		}

		const matched = await PasswordHelper.PasswordCompare(password, user.password);
		if (!matched) {
			return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
		}

		const dataUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			roleId: user.roleId,
			verified: user.verified,
			active: user.active
		};
		const token = Helper.GenerateToken(dataUser);
		const refreshToken = Helper.GenerateRefreshToken(dataUser);

		user.accessToken = refreshToken;
		await user.save();
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000
		});

		const roleAccess = await RoleMenuAccess.findAll({
			where: {
				roleId: user.roleId,
				active: true
			}
		});

		const listSubmenuId = roleAccess.map((item) => {
			return item.submenuId
		});

		const menuAccess = await MasterMenu.findAll({
			where: {
				active: true
			},
			order: [
				['ordering', 'ASC'],
				[Submenu, 'ordering', 'ASC']
			],
			include: {
				model: Submenu,
				where: {
					id: { [Op.in]: listSubmenuId }
				}
			}
		});


		const responseUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			roleId: user.roleId,
			verified: user.verified,
			active: user.active,
			token: token,
			menuAccess: menuAccess
		}
		return res.status(200).send(Helper.ResponseData(200, "OK", null, responseUser));
	} catch (error) {
		return res.status(500).send(Helper.ResponseData(500, "", error, null));
	}
};

const RefreshToken = async (req: Request, res: Response): Promise<Response> => {
	try {
		const refreshToken = req.cookies?.refreshToken;

		if (!refreshToken) {
			return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
		}

		const decodedUser = Helper.ExtractRefreshToken(refreshToken);
		console.log(decodedUser);
		if (!decodedUser) {
			return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
		}

		const token = Helper.GenerateToken({
			name: decodedUser.name,
			email: decodedUser.email,
			roleId: decodedUser.roleId,
			verified: decodedUser.verified,
			active: decodedUser.active
		});

		const resultUser = {
			name: decodedUser.name,
			email: decodedUser.email,
			roleId: decodedUser.roleId,
			verified: decodedUser.verified,
			active: decodedUser.active,
			token: token
		}

		return res.status(200).send(Helper.ResponseData(200, "OK", null, resultUser));

	} catch (error) {
		return res.status(500).send(Helper.ResponseData(500, "", error, null));
	}
};

const UserDetail = async (req: Request, res: Response): Promise<Response> => {
	try {
		const email = res.locals.userEmail;
		const user = await User.findOne({
			where: {
				email: email
			},
			include: {
				model: Role,
				attributes: ["id", "roleName"]
			}
		});

		if (!user) {
			return res.status(404).send(Helper.ResponseData(404, "User not found", null, null));
		}

		const userResponse = await serialize(user)

		
		// user.accessToken = "";
		return res.status(200).send(Helper.ResponseData(200, "OK", null, userResponse.data));
	} catch (error) {
		return res.status(500).send(Helper.ResponseData(500, "", error, null));
	}
};

const UserUpdate = async (req: Request, res: Response): Promise<Response> => {
	try {
		const useEmail = res.locals.userEmail;

		const {name , email } = req.body

		const dataUser = {
			name: name,
			email: email
		}

		const user = await User.findOne({
			where: {
				email: useEmail
			}
		});
		
		if (!user) {
			return res.status(404).send(Helper.ResponseData(404, "User not found", null, null));
		}

    	await user.update(dataUser)

		const updatedUser = await serialize(user)

		return res.status(200).send(Helper.ResponseData(200, "OK", null, updatedUser));


	} catch (error) {
		return res.status(500).send(Helper.ResponseData(500, "", error, null));
	}
}

const UserLogout = async (req: Request, res: Response): Promise<Response> => {
	try {
		const refreshToken = req.cookies?.refreshToken;
		if (!refreshToken) {
			return res.status(200).send(Helper.ResponseData(200, "User logout", null, null));
		}
		const email = res.locals.userEmail;
		const user = await User.findOne({
			where: {
				email: email
			}
		});

		if (!user) {
			res.clearCookie("refreshToken");
			return res.status(200).send(Helper.ResponseData(200, "User logout", null, null));
		}

		await user.update({ accessToken: null }, { where: { email: email } });
		res.clearCookie("refreshToken");
		return res.status(200).send(Helper.ResponseData(200, "User logout", null, null));
	} catch (error) {
		return res.status(500).send(Helper.ResponseData(500, "", error, null));
	}
}

export default { Register, UserLogin, RefreshToken,UserDetail, UserLogout, UserUpdate };