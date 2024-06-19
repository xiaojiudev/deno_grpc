import { UserCollection } from "../model/UserSchema.ts";
import { CSVWriter } from "jsr:@vslinko/csv@1.0.2";

export const saveUserFavLog = async () => {
    const userDocs = await UserCollection.find({});

    const f = await Deno.open("./dataset/user_fav.data", {
        write: true,
        create: true,
        truncate: true,
    });

    const writer = new CSVWriter(f, {
        columnSeparator: "\t",
        lineSeparator: "\r\n",
    });

    for (const user of userDocs) {
        const { id, favCategories } = user.toClient();
        if (id && favCategories) {
            for (const category of favCategories) {
                await writer.writeCell(id.toString());
                await writer.writeCell(category.toString());
                await writer.writeCell("1");
                await writer.writeCell(Date.now().toString());
                await writer.nextLine();
            }
        }
    }

    f.close();
}