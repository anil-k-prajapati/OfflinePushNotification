using MySql.Data.MySqlClient;
using System.Data;

namespace OfflinePushNotification.Data
{
    public class DatabaseHelper
    {
        private readonly string _connectionString;
        private readonly ILogger<DatabaseHelper> _logger;

        public DatabaseHelper(IConfiguration configuration, ILogger<DatabaseHelper> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException("Connection string not found");
            _logger = logger;
        }

        public async Task<MySqlConnection> GetConnectionAsync()
        {
            var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            return connection;
        }

        public async Task<T?> ExecuteScalarAsync<T>(string storedProcedure, params MySqlParameter[] parameters)
        {
            try
            {
                using var connection = await GetConnectionAsync();
                using var command = new MySqlCommand(storedProcedure, connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                if (parameters != null)
                    command.Parameters.AddRange(parameters);

                var result = await command.ExecuteScalarAsync();
                return result == null || result == DBNull.Value ? default(T) : (T)Convert.ChangeType(result, typeof(T));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing scalar command: {StoredProcedure}", storedProcedure);
                throw;
            }
        }

        public async Task<int> ExecuteNonQueryAsync(string storedProcedure, params MySqlParameter[] parameters)
        {
            try
            {
                using var connection = await GetConnectionAsync();
                using var command = new MySqlCommand(storedProcedure, connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                if (parameters != null)
                    command.Parameters.AddRange(parameters);

                return await command.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing non-query command: {StoredProcedure}", storedProcedure);
                throw;
            }
        }

        public async Task<List<T>> ExecuteReaderAsync<T>(string storedProcedure, Func<MySqlDataReader, T> mapper, params MySqlParameter[] parameters)
        {
            var results = new List<T>();

            try
            {
                using var connection = await GetConnectionAsync();
                using var command = new MySqlCommand(storedProcedure, connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                if (parameters != null)
                    command.Parameters.AddRange(parameters);

                using var reader = (MySqlDataReader)await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    results.Add(mapper(reader));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing reader command: {StoredProcedure}", storedProcedure);
                throw;
            }

            return results;
        }

        public async Task<T?> ExecuteReaderSingleAsync<T>(string storedProcedure, Func<MySqlDataReader, T> mapper, params MySqlParameter[] parameters)
        {
            try
            {
                using var connection = await GetConnectionAsync();
                using var command = new MySqlCommand(storedProcedure, connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                if (parameters != null)
                    command.Parameters.AddRange(parameters);

                using var reader = (MySqlDataReader)await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return mapper(reader);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing single reader command: {StoredProcedure}", storedProcedure);
                throw;
            }

            return default(T);
        }
    }
}
