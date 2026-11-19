using System.Text.Json;
using Server.Common;
using Server.Models;

namespace Server.Data;

public class JsonFileApplicationRepository : IApplicationRepository
{
    private static readonly JsonSerializerOptions JsonOptions = CreateJsonOptions();

    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public JsonFileApplicationRepository(IConfiguration configuration, IHostEnvironment environment)
    {
        var relativePath = configuration["Storage:FilePath"] ?? "data/applications.json";
        _filePath = Path.Combine(environment.ContentRootPath, relativePath);
    }

    public async Task<IReadOnlyList<JobApplication>> GetAllAsync()
    {
        await _lock.WaitAsync();
        try
        {
            return await ReadAsync();
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<JobApplication?> GetByIdAsync(Guid id)
    {
        var all = await GetAllAsync();
        return all.FirstOrDefault(a => a.Id == id);
    }

    public Task AddAsync(JobApplication application) =>
        ModifyAsync(list =>
        {
            list.Add(application);
            return true;
        });

    public Task<bool> UpdateAsync(JobApplication application) =>
        ModifyAsync(list =>
        {
            var index = list.FindIndex(a => a.Id == application.Id);
            if (index == -1) return false;
            list[index] = application;
            return true;
        });

    public Task<bool> DeleteAsync(Guid id) =>
        ModifyAsync(list => list.RemoveAll(a => a.Id == id) > 0);

    // קורא, משנה וכותב בתוך נעילה אחת, כדי ששתי בקשות לא ידרסו זו את זו
    private async Task<bool> ModifyAsync(Func<List<JobApplication>, bool> change)
    {
        await _lock.WaitAsync();
        try
        {
            var list = await ReadAsync();
            if (!change(list)) return false;
            await WriteAsync(list);
            return true;
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<List<JobApplication>> ReadAsync()
    {
        if (!File.Exists(_filePath)) return [];

        await using var stream = File.OpenRead(_filePath);
        return await JsonSerializer.DeserializeAsync<List<JobApplication>>(stream, JsonOptions) ?? [];
    }

    // כותב לקובץ זמני ואז מחליף, כדי שקריסה באמצע לא תשחית את הנתונים
    private async Task WriteAsync(List<JobApplication> list)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
        var tempPath = _filePath + ".tmp";

        await using (var stream = File.Create(tempPath))
        {
            await JsonSerializer.SerializeAsync(stream, list, JsonOptions);
        }

        File.Move(tempPath, _filePath, overwrite: true);
    }

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true };
        JsonSettings.Apply(options);
        return options;
    }
}