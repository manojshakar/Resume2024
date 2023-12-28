import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.zc.component.files.ZCFile;
import com.zc.component.files.ZCFileDetail;
import com.zc.component.files.ZCFolder;
import com.zc.common.ZCProject;
import com.zc.component.object.ZCObject;
import com.zc.component.object.ZCRowObject;
import com.zc.component.object.ZCRowPagedResponse;

import com.catalyst.advanced.CatalystAdvancedIOHandler;

public class PasswordProtect implements CatalystAdvancedIOHandler {

	private static String PASSWORD_TABLE_ID = "4603000000003790";
	private static String DOMAINS_TABLE_ID = "4603000000003063";
	private static Long MANOJ_FOLDER_ID = 4603000000004527l;
	private static Long RAGHU_FOLDER_ID = 4603000000005018l;
	private static final Logger LOGGER = Logger.getLogger(PasswordProtect.class.getName());

	private ArrayList<String> getDomains(){
		ArrayList<String> domains = new ArrayList<String>();
		ZCRowPagedResponse pagedResp = null;
		String nextToken = null;
		try {
			//Define the maximum rows to be fetched in a single page 
			do
			{
					pagedResp = ZCObject.getInstance().getTable(DOMAINS_TABLE_ID).getPagedRows(nextToken);
					//Specify the table name and fetch the paged response by passing nextToken and maxRows 
					//Fetch the columns from the table by passing the column names 
					for(ZCRowObject row : pagedResp.getRows()){ 
						String domain =  (String) row.get("Domain");
						domains.add(domain);
						
						//Validate the iteration and pass the token string obtained in the response for the next iteration 
						if(pagedResp.moreRecordsAvailable())
						{
							nextToken = pagedResp.getNextToken(); 
						}
					}
			}while(pagedResp.moreRecordsAvailable());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return domains;
	}
	
	private String validatePasscode(String passcode) {
		String nextToken = null; 
		ZCRowPagedResponse pagedResp;
		try {
			//Define the maximum rows to be fetched in a single page 
			do
			{ 
					pagedResp = ZCObject.getInstance().getTable(PASSWORD_TABLE_ID).getPagedRows(nextToken);
					//Specify the table name and fetch the paged response by passing nextToken and maxRows 
					//Fetch the columns from the table by passing the column names 
					for(ZCRowObject row : pagedResp.getRows()){ 
						String password =  (String) row.get("password");
						String date = (String) row.get("expiry");
				        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
				        LocalDateTime dateTime = LocalDateTime.parse(date, formatter);
				       
				        if(dateTime.isAfter(LocalDateTime.now()) && password.equals(passcode)) {
				        	return "Valid";
				        }
				        else if(!dateTime.isAfter(LocalDateTime.now()) && password.equals(passcode)) {
				        	return "Expired";
				        }
				        
						//res.getWriter().write(password+" --- "+date+" --- "+(dateTime.isAfter(LocalDateTime.now()))+"\n");
						
						//Validate the iteration and pass the token string obtained in the response for the next iteration 
						if(pagedResp.moreRecordsAvailable())
						{
							nextToken = pagedResp.getNextToken(); 
						}
					}
			}while(pagedResp.moreRecordsAvailable());
		} catch (Exception e) {
			e.printStackTrace();
		} 
		return "Invalid";
	}
	
	private void setCORS(HttpServletResponse response, String origin) {

		ArrayList<String> domains = getDomains();
		LOGGER.log(Level.INFO, origin + " "+ domains.toString());
		for(int i=0; i<domains.size(); i++) {
		// Allow requests only from specific origins
			if (origin != null && (origin.equals(domains.get(i)))){
	
				response.setHeader("Access-Control-Allow-Origin", origin);
				response.setHeader("Access-Control-Allow-Methods", "POST");
				response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
				response.setHeader("Access-Control-Allow-Credentials", "true");
				response.setHeader("Access-Control-Max-Age", "3600");
				break;
			} 
		}
	}
	
	private void downloadFile(HttpServletResponse response, String filename, Long folderid) throws Exception {
		//Get an instance for the file store
		ZCFile fileStore = ZCFile.getInstance();
		//Get Folder Details using Folder ID
		ZCFolder folderDetails = fileStore.getFolder(folderid);
		//response.getWriter().write(folderDetails.toString());
		
		List<ZCFileDetail> files = folderDetails.getFileDetails();
		InputStream file = null;
		for(int i=0; i<files.size(); i++) {
			if(files.get(i).getFileName().equalsIgnoreCase(filename)) {
				//response.getWriter().write(files.get(i).getFileName()+"\n");
				Long fileId = files.get(i).getFileId();
				file = folderDetails.downloadFile(fileId);
				break;
			}
		}
		
		if(file != null) {
	        try {
	            byte[] buffer = new byte[4096];
	            int bytesRead;
	            while ((bytesRead = file.read(buffer)) != -1) {
	                response.getOutputStream().write(buffer, 0, bytesRead);
	            }
	        } catch (IOException e) {
	            // Handle exceptions if necessary
	            e.printStackTrace();
	        } finally {
	            // Close the InputStream and flush/close the PrintWriter
	            file.close();
	            response.setContentType("text/html; charset=utf-8");
	            response.setStatus(200);
	            response.getOutputStream().flush();
	            response.getOutputStream().close();
	        }

		}else {
			setError(response, "Invalid filename");
		}
		
		
	}
	
	private void setError(HttpServletResponse response, String reason) throws IOException {
		response.getWriter().write("{'status':'error', 'reason':'"+reason+"'}");
        response.setContentType("application/json; charset=utf-8");
        response.setStatus(400);
	
	}
	
	public void runner(HttpServletRequest request, HttpServletResponse response) throws Exception {
		ZCProject.initProject();
		String passcode = request.getParameter("passcode");
		String filename = request.getParameter("filename");
		String origin = request.getHeader("Origin");
		
		try {
			setCORS(response, origin);
			String checkStatus = validatePasscode(passcode);
			if(checkStatus.equals("Valid")) {
				Long file_id = MANOJ_FOLDER_ID;
				if(origin.contains("raghu"))
					file_id = RAGHU_FOLDER_ID;
				downloadFile(response, filename, file_id);
			}else if(checkStatus.equals("Expired")){
				setError(response, "Expired passcode");
			}else{
				setError(response, "Invalid passcode");
			}
		} catch (Exception e) {
			setError(response, e.getMessage());
		}
	}
}
