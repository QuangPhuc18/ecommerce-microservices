import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
public class UpdateDB {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/product_db?useSSL=false&serverTimezone=UTC";
        try (Connection conn = DriverManager.getConnection(url, "root", "");
             Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE products ADD COLUMN sub_category VARCHAR(255);");
            System.out.println("Success");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
