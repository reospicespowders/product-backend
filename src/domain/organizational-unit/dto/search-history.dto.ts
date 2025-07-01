import { User } from "src/domain/user-auth/dto/user-type..dto";


export class SearchHistory {
    category_id?: number;
    user_id: string | User;
    keyword: string;
}