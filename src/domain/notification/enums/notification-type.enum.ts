

export enum NotificationType {
    DATA_UPDATE = "تم تحديث البيانات",
    CONTENT_RECEIVED_FOR_APPROVAL = "تم استلام طلب الموافقة على محتوى جديد",
    USER_REGISTER = "تم تسجيل مستخدم جديد",
    NEW_COMMENT = "تم إضافة تعليق جديد على خدمة",
    COMMENT_REPLY = "تم الرد على تعليقك على خدمة",
    KLIBRARY_NOTIFICATION = "إضافة جديدة لمكتبة المعرفة",
    SURVEY = "تم إنشاء استطلاع",
    ASSESSMENT = "تم إنشاء اختبار",

    //New Skill Training
    NEW_SKILL_TRAINING_CREATE = "تم إنشاء دورة تدريبية جديدة للنشر",
    NEW_SKILL_SELF = "دورة تدريبية جديدة متاحة للتسجيل",
    NEW_SKILL_MANAGER = "لقد أستلمت دورة تدريبية جديدة لوحدتك التنظيمية",
    NEW_SKILL_CANCELLED = "تم إلغاء الدورة التدريبية",


    //Continuous Training
    CONTINUOUS_TRAINING_CREATE = "لقد استلمت طلب دورة تدريبية",
    CONTINUOUS_TRAINING_PUBLISH = "تم إضافتك للتدريب المستدام",

    //Branch Training
    BRANCH_TRAINING_CREATE = "تم إنشاء دورة تدريب فرع جديد",
    BRANCH_TRAINING_PUBLISH = "تم إضافتك لدورة تدريب فرع جديد",

    //Misc 
    COURSE_ADD_REQUEST = "لقد استلمت طلب الإضافة للدورة التدريبية",

    CUSTOM_NOTIFICATION = "Custom Alert",

    TRAINER_ADDED = "تم إضافتك كمدرب لهذه الدورة التدريبية",

    MASTER_TRAINER_ADDED = "تم إضافتك كمدرب أساسي لهذه الدورة التدريبية",
    PERMISSION_REQUEST_CREATED = "New Permission Request Created",
    PERMISSION_REQUEST_APPROVED = "Permission Approved Successfully"
}