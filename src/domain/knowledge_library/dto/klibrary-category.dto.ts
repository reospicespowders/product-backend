import { IntersectionType } from "@nestjs/swagger";



export class KLibraryCategory {
    name: string;
    icon: string;
}

export class DeleteLibraryCategoryRequest {
    _id: string;
    deleteData: boolean;
    changeCategory: KLibraryCategory
}

export class UpdateKLibraryCategory extends IntersectionType(KLibraryCategory) {
    _id: string;
}