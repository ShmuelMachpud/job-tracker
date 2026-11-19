using System.Net;
using System.Net.Sockets;

namespace Server.Extraction.Fetching;

/// <summary>
/// חיבור רשת שמסכים להתחבר רק לכתובות ציבוריות באינטרנט.
/// בלי זה, מישהו יכול לשלוח קישור כמו http://localhost:5228 ולגרום לשרת לפנות לשירותים פנימיים.
/// הבדיקה נעשית ברגע החיבור עצמו, ולכן היא חלה גם על הפניות (redirect) לכתובת אחרת.
/// </summary>
public static class PublicNetworkHandler
{
    public static SocketsHttpHandler Create() =>
        new()
        {
            AllowAutoRedirect = true,
            MaxAutomaticRedirections = 5,
            AutomaticDecompression = DecompressionMethods.All,
            // proxy של המחשב עלול להיות כתובת פנימית, ואז כל חיבור ייחסם
            UseProxy = false,
            ConnectCallback = ConnectToPublicAddressAsync,
        };

    private static async ValueTask<Stream> ConnectToPublicAddressAsync(
        SocketsHttpConnectionContext context,
        CancellationToken cancellationToken
    )
    {
        var addresses = await Dns.GetHostAddressesAsync(context.DnsEndPoint.Host, cancellationToken);
        var address =
            addresses.FirstOrDefault(IsPublic)
            ?? throw new HttpRequestException("הכתובת לא מפנה לאינטרנט הציבורי");

        var socket = new Socket(address.AddressFamily, SocketType.Stream, ProtocolType.Tcp)
        {
            NoDelay = true,
        };

        try
        {
            // מתחברים לכתובת שנבדקה, ולא שוב לפי השם, כדי שהשם לא יוכל להחליף כתובת באמצע
            await socket.ConnectAsync(new IPEndPoint(address, context.DnsEndPoint.Port), cancellationToken);
            return new NetworkStream(socket, ownsSocket: true);
        }
        catch
        {
            socket.Dispose();
            throw;
        }
    }

    public static bool IsPublic(IPAddress address)
    {
        if (address.IsIPv4MappedToIPv6)
            address = address.MapToIPv4();

        if (IPAddress.IsLoopback(address))
            return false;

        return address.AddressFamily switch
        {
            AddressFamily.InterNetwork => IsPublicIPv4(address.GetAddressBytes()),
            AddressFamily.InterNetworkV6 => IsPublicIPv6(address),
            _ => false,
        };
    }

    private static bool IsPublicIPv4(byte[] b) =>
        !(
            b[0] == 0 // "הרשת הזו"
            || b[0] == 10 // רשת פרטית
            || (b[0] == 100 && b[1] >= 64 && b[1] <= 127) // רשת של ספקי אינטרנט
            || (b[0] == 169 && b[1] == 254) // link-local, כולל שירותי מטא־דאטה בענן
            || (b[0] == 172 && b[1] >= 16 && b[1] <= 31) // רשת פרטית
            || (b[0] == 192 && b[1] == 168) // רשת פרטית ביתית
            || b[0] >= 224 // multicast ושמורות
        );

    private static bool IsPublicIPv6(IPAddress address) =>
        !(
            address.Equals(IPAddress.IPv6Any)
            || address.IsIPv6LinkLocal
            || address.IsIPv6SiteLocal
            || address.IsIPv6Multicast
            || (address.GetAddressBytes()[0] & 0xFE) == 0xFC // fc00::/7, רשת פרטית
        );
}
