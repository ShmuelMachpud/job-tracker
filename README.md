# JobTracker

מערכת אישית למעקב אחרי חיפוש עבודה: לאן הגשתי, באיזה שלב כל משרה נמצאת, ומה צריך לעשות הלאה.

**האתר:** https://job-tracker-cuhm.onrender.com (נכנסים עם חשבון Google המורשה בלבד)

## מה יש בה

- **תמונת מצב:** סה״כ משרות, פעילות, כמה הגיעו לראיון, ואחוז התגובה מהחברות.
- **צריך לעקוב:** משרות שהגיע מועד הפעולה הבאה שלהן, או שהוגשו לפני 7 ימים ויותר בלי תגובה.
- **רשימת המשרות** עם חיפוש וסינון לפי סטטוס. את הסטטוס משנים ישירות מהשורה, וכל שינוי נרשם בהיסטוריה.
- **הוספה ועריכה** בחלון אחד, כולל חילוץ פרטים אוטומטי מקישור למשרה.
- **סטטוסים:** טרם הוגשה, הוגש, סינון ראשוני, ראיון, מטלת בית, הצעה, נדחה, אין מענה.

## טכנולוגיות

| חלק | טכנולוגיה |
|---|---|
| אתר | Angular 22, ‏Angular Material |
| שרת | ‏.NET 10, ‏Minimal API, ‏Entity Framework Core |
| מסד נתונים | Postgres ב־[Neon](https://neon.tech) |
| התחברות | Google, דרך עוגייה מוצפנת, למייל אחד מורשה |
| אירוח | [Render](https://render.com), מתוך `Dockerfile` |

## מבנה הפרויקט

```
job-tracker/
├── client/                  האתר (Angular)
│   └── src/app/
│       ├── applications/    כל מה שקשור למשרות
│       │   ├── models/      צורת הנתונים, מקבילה לחוזים בשרת
│       │   ├── data/        פנייה לשרת (HttpClient)
│       │   ├── state/       ApplicationsStore: הרשימה בזיכרון, מקור האמת של המסך
│       │   ├── logic/       חוקים כפונקציות טהורות: סינון, מדדים, "צריך לעקוב"
│       │   ├── forms/       מבנה הטופס והמרה לבקשה לשרת
│       │   ├── components/  רכיבי תצוגה: טבלה, חלון, מדדים ועוד
│       │   └── applications-page/  המסך, שמחבר בין ה־Store לרכיבים
│       ├── auth/            התחברות: מעבר לדף ההתחברות ב־401, והמשתמש המחובר
│       └── layout/          המסגרת של האפליקציה והסרגל העליון
│
├── server/                  השרת (.NET)
│   ├── Endpoints/           נתיבי HTTP. רק מתרגמים בין HTTP לשירות
│   ├── Services/            החוקים העסקיים
│   ├── Data/                EF Core: המסד, הגדרות הטבלאות וה־Repository
│   ├── Migrations/          היסטוריית המבנה של המסד
│   ├── Models/              המשרה עצמה
│   ├── Contracts/           מה שעובר בין האתר לשרת
│   ├── Extraction/          חילוץ פרטי משרה מדף אינטרנט
│   └── Common/              התחברות, CORS, תוצאות והגדרות JSON
│
└── Dockerfile               בונה את האתר ואת השרת, ומריץ הכול כשרת אחד
```

**העיקרון:** כל שכבה יודעת רק את מה שהיא צריכה. ה־Endpoints לא יודעים איפה הנתונים נשמרים, השירות לא יודע מה זה HTTP, וה־Repository לא יודע מה החוקים. בזכות זה המעבר מקובץ JSON ל־SQLite ואחר כך ל־Postgres שינה רק את שכבת ה־Data.

## הרצה במחשב

### מה צריך
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 24](https://nodejs.org)
- מסד Postgres לפיתוח. אצלנו: הענף `dev` ב־Neon.
- אפליקציית התחברות ב־Google Cloud Console, עם כתובת ההחזרה `http://localhost:5228/signin-google`.

### הגדרות סודיות (פעם אחת)
הסודות נשמרים ב־User Secrets, מחוץ לתיקיית הפרויקט, ולעולם לא נכנסים ל־git:

```bash
cd server
dotnet user-secrets set "ConnectionStrings:Jobs" 'Host=...; Database=...; Username=...; Password=...; SSL Mode=VerifyFull'
dotnet user-secrets set "Authentication:Google:ClientId" '...'
dotnet user-secrets set "Authentication:Google:ClientSecret" '...'
dotnet user-secrets set "Auth:AllowedEmail" 'המייל-המורשה@gmail.com'
```

### הרצה
שני טרמינלים:

```bash
# שרת, על http://localhost:5228
cd server
dotnet run
```

```bash
# אתר, על http://localhost:4200
cd client
npm install
npm start
```

בהפעלה הראשונה השרת יוצר את הטבלאות במסד לבד (`MigrateAsync`).

### שינוי במבנה המסד
אחרי שינוי במודל או בהגדרות הטבלאות:

```bash
cd server
dotnet ef migrations add שם-השינוי
```

השינוי ירוץ על המסד בהפעלה הבאה של השרת, גם במחשב וגם בענן. הכלי `dotnet-ef` מוגדר ב־`dotnet-tools.json`, ומותקן עם `dotnet tool restore`.

## פריסה

**כל מיזוג ל־`main` מעלה גרסה חדשה לבד.** ‏Render מושך את הקוד, בונה לפי ה־`Dockerfile`, ומעביר את התנועה לגרסה החדשה רק אחרי ש־`/health` עונה.

**משתני הסביבה ב־Render:**

| משתנה | מה הוא |
|---|---|
| `ConnectionStrings__Jobs` | מחרוזת החיבור לענף `production` ב־Neon |
| `Authentication__Google__ClientId` | מזהה אפליקציית ההתחברות ב־Google |
| `Authentication__Google__ClientSecret` | הסוד של אפליקציית ההתחברות |
| `Auth__AllowedEmail` | המייל היחיד שמורשה להיכנס |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | `true`. ‏Render מעביר לשרת בקשות HTTPS כ־HTTP, וזה מחזיר לשרת את הכתובת המקורית |

**שירות שמשאיר את השרת ער:** ‏UptimeRobot פונה ל־`/health` כל 5 דקות, ושולח מייל אם האתר לא עונה. ‏`/health` לא פונה למסד, כדי שהמסד ב־Neon יוכל להירדם כשלא משתמשים באתר.

## אבטחה

- **כל נתיב דורש התחברות כברירת מחדל,** חוץ מ־`/auth` ו־`/health`. נתיב חדש מוגן אוטומטית.
- **רק מייל אחד נכנס,** והבדיקה נעשית גם בזמן ההתחברות וגם בכל בקשה. בנוסף, אפליקציית ההתחברות ב־Google נשארת במצב Testing, ולכן רק משתמשים שברשימה יכולים להתחבר בכלל.
- **מפתחות ההצפנה של העוגייה נשמרים במסד,** כדי שההתחברות תישאר בתוקף אחרי עדכון גרסה.
- **חילוץ פרטים מקישור** מתחבר רק לכתובות ציבוריות באינטרנט, כדי שאי אפשר יהיה לגרום לשרת לפנות לשירותים פנימיים.
