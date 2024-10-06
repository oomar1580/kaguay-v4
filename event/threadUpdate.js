import { log } from "../logger/index.js";

export default {
  name: "threadUpdate",
  execute: async ({ api, event, Threads }) => {
    try {
      // العثور على بيانات المجموعة باستخدام معرّف المجموعة
      let threadData = await Threads.findOne({ threadID: event.threadID });

      // إذا كانت البيانات غير موجودة، قم بإنشاء مجموعة جديدة
      if (!threadData) {
        threadData = new Threads({ threadID: event.threadID });
        await threadData.save();
      }

      const threads = threadData.data || {};

      // إذا كانت البيانات فارغة، أوقف المعالجة
      if (!Object.keys(threads).length) return;

      // التعامل مع أنواع التحديث المختلفة
      switch (event.logMessageType) {
        case "log:thread-name":
          await handleThreadName(api, event, Threads, threadData);
          break;
        case "change_thread_admins":
          await handleAdminChange(api, event, Threads, threadData);
          break;
        case "change_thread_approval_mode":
          await handleApprovalModeChange(api, event, Threads, threadData);
          break;
        case "log:thread-icon":
          await handleThreadIconChange(api, event, Threads, threadData);
          break;
        case "change_thread_nickname":
          await handleNicknameChange(api, event, Threads, threadData);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error handling thread update:", error);
    }
  },
};

// التعامل مع تغيير الكنية
async function handleNicknameChange(api, event, Threads, threadData) {
  const { userID, newNickname } = event.logMessageData;

  if (threadData.data.anti?.nicknameBox) {
    await api.setUserNickname(userID, threadData.data.oldNicknames[userID] || "");
    return api.sendMessage(
      `❌ | ميزة حماية الكنية مفعلة، لذا لم يتم تغيير كنية العضو 🔖 | <${event.threadID}> - ${threadData.data.name}`,
      event.threadID
    );
  }

  // تحديث الكنية في البيانات
  threadData.data.oldNicknames = threadData.data.oldNicknames || {};
  threadData.data.oldNicknames[userID] = newNickname;

  await threadData.save();

  const adminName = await getUserName(api, event.author);
  api.sendMessage(
    `تم تغيير كنية العضو <${userID}> إلى: ${newNickname} 🔖 | بواسطة: ${adminName}`,
    event.threadID
  );
}

// التعامل مع تغيير الاسم
async function handleThreadName(api, event, Threads, threadData) {
  const { name: oldName = null } = threadData.data;
  const { name: newName } = event.logMessageData;

  if (threadData.data.anti?.nameBox) {
    await api.setTitle(oldName, event.threadID);
    return api.sendMessage(
      `❌ | ميزة حماية الاسم مفعلة، لذا لم يتم تغيير اسم المجموعة 🔖 | <${event.threadID}> - ${threadData.data.name}`,
      event.threadID
    );
  }

  threadData.data.name = newName;
  await threadData.save();

  const adminName = await getUserName(api, event.author);
  api.sendMessage(
    `تم تغيير الاسم الجديد للمجموعة إلى: 🔖 | - 『${newName}』 بواسطة: ${adminName}`,
    event.threadID
  );
}

// التعامل مع تغيير المسؤولين
async function handleAdminChange(api, event, Threads, threadData) {
  const { adminIDs = [] } = threadData.data;
  const { TARGET_ID, ADMIN_EVENT } = event.logMessageData;

  if (ADMIN_EVENT === "add_admin" && !adminIDs.includes(TARGET_ID)) {
    adminIDs.push(TARGET_ID);
  }

  if (ADMIN_EVENT === "remove_admin") {
    const indexOfTarget = adminIDs.indexOf(TARGET_ID);
    if (indexOfTarget > -1) {
      adminIDs.splice(indexOfTarget, 1);
    }
  }

  threadData.data.adminIDs = adminIDs;
  await threadData.save();

  const action = ADMIN_EVENT === "add_admin" ? "✅ إضافة" : "❌ إزالة";
  const adminName = await getUserName(api, TARGET_ID);
  api.sendMessage(
    `🔖 | تمت ${action} ${adminName} كآدمن في المجموعة`,

    event.threadID
  );
}

// التعامل مع تغيير وضع الموافقة
async function handleApprovalModeChange(api, event, Threads, threadData) {
  const { APPROVAL_MODE } = event.logMessageData;
  threadData.data.approvalMode = APPROVAL_MODE === 0 ? false : true;
  await threadData.save();

  const action = APPROVAL_MODE === 0 ? "❌ تعطيل" : "✅ تفعيل";
  api.sendMessage(
    `تم ${action} ميزة الموافقة في المجموعة 🔖 | <${event.threadID}> - ${threadData.data.name}`,
    event.threadID
  );
}

// التعامل مع تغيير أيقونة المجموعة
async function handleThreadIconChange(api, event, Threads, threadData) {
  try {
    const { threadThumbnail: oldIcon } = threadData.data; // جلب الصورة القديمة من المخطط
    const newIcon = event.logMessageData.threadThumbnail; // جلب الصورة الجديدة من الحدث

    // تحقق إذا كانت ميزة حماية الصورة مفعلة
    if (threadData.data.anti?.imageBox) {
      // إذا كانت مفعلة، إعادة الصورة القديمة وإبلاغ المجموعة
      await api.changeGroupImage(oldIcon, event.threadID);
      await api.sendMessage(
        `❌ | ميزة حماية صورة المجموعة مفعلة، لذا لم يتم تغيير صورة المجموعة 📷 | <${event.threadID}> - ${threadData.data.name}`,
        event.threadID
      );
      return;
    }

    // تحقق من صحة رابط الصورة الجديدة
    if (!isValidImageUrl(newIcon)) {
      return api.sendMessage(
        `❌ | رابط الصورة غير صالح. يرجى استخدام رابط مباشر لصورة بصيغة jpg, jpeg, png, أو gif.`,
        event.threadID
      );
    }

    // تحديث الصورة الجديدة في قاعدة البيانات
    threadData.data.threadThumbnail = newIcon;
    await threadData.save();

    // جلب اسم المسؤول الذي قام بالتغيير
    const adminName = await getUserName(api, event.author);
    api.sendMessage(
      `✅ | تم تغيير صورة المجموعة الجديدة بواسطة: ${adminName}`,
      event.threadID
    );
  } catch (error) {
    console.error("Error in handleThreadIconChange:", error);
  }
}

// التحقق من صحة رابط الصورة
function isValidImageUrl(url) {
  const regex = /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i;
  return regex.test(url);
}

// الحصول على اسم المستخدم
async function getUserName(api, userID) {
  const userInfo = await api.getUserInfo(userID);
  return userInfo?.[userID]?.name || "Unknown";
}
