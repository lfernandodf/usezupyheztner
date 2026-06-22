import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";
import User from "../../models/User";

interface Request {
  name: string;
  email: string;
  password: string;
}

interface Response {
  tenant: Tenant;
  user: { id: number; name: string; email: string; profile: string };
}

const CreateTenantService = async ({
  name, email, password
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    email: Yup.string().email().required()
      .test("Check-email", "Este e-mail já existe.",
        async value => !(await User.findOne({ where: { email: value! } }))),
    password: Yup.string().required().min(5)
  });

  try { await schema.validate({ name, email, password }); }
  catch (err) { throw new AppError(err.message); }

  const tenant = await Tenant.create({ name, status: "active" });

  const user = await User.create({
    email, password, name, profile: "admin", tenantId: tenant.id
  });

  await tenant.update({ ownerId: user.id });

  return {
    tenant,
    user: { id: user.id, name: user.name, email: user.email, profile: user.profile }
  };
};

export default CreateTenantService;