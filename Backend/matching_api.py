import requests
import json
import sys
import traceback  # 添加traceback模块用于详细错误报告

API_BASE_URL = 'https://causeconnect-api.onrender.com'

def match_organizations(name, org_type, description, target_audience, preferred_org_type, partnership_description, industry="", industry_category=""):
    try:
        # 打印接收到的参数，便于调试
        print(f"Received parameters:", file=sys.stderr)
        print(f"Name: {name}", file=sys.stderr)
        print(f"Type: {org_type}", file=sys.stderr)
        print(f"Description: {description}", file=sys.stderr)
        print(f"Target Audience: {target_audience}", file=sys.stderr)
        print(f"Preferred Org Type: {preferred_org_type}", file=sys.stderr)
        print(f"Partnership Description: {partnership_description}", file=sys.stderr)
        print(f"Industry: {industry}", file=sys.stderr)
        print(f"Industry Category: {industry_category}", file=sys.stderr)
        
        # 检查必要参数是否为空
        if not name or not description or not partnership_description:
            print("Warning: Some essential parameters are empty", file=sys.stderr)
        
        request_data = {
            "Name": name,
            "Type": org_type,
            "Description": description,
            "Target Audience": target_audience,
            "Organization looking 1": preferred_org_type,
            "Organization looking 2": partnership_description,
            "Industry": industry,
            "Industry Category": industry_category
        }

        print(f"Sending request to API with data: {json.dumps(request_data, indent=2)}", file=sys.stderr)
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/test/complete-matching-process",
                headers={
                    "Content-Type": "application/json"
                },
                json=request_data,
                timeout=60  # 设置60秒超时
            )
            
            # 检查响应状态
            if response.status_code != 200:
                print(f"API返回了非200状态码: {response.status_code}", file=sys.stderr)
                print(f"响应内容: {response.text}", file=sys.stderr)
                return {
                    "error": f"API returned status code {response.status_code}",
                    "response_text": response.text
                }
                
            # 尝试解析响应为JSON
            try:
                data = response.json()
                print(f"成功解析API响应: {json.dumps(data)[:200]}...", file=sys.stderr)  # 打印前200个字符
                return data
            except json.JSONDecodeError as json_error:
                print(f"无法解析API响应为JSON: {json_error}", file=sys.stderr)
                print(f"响应内容: {response.text[:200]}...", file=sys.stderr)  # 打印前200个字符
                return {
                    "error": f"Failed to parse API response as JSON: {str(json_error)}",
                    "response_text": response.text
                }
        except requests.exceptions.RequestException as req_error:
            print(f"请求API时出错: {req_error}", file=sys.stderr)
            return {"error": f"Request to API failed: {str(req_error)}"}
    except Exception as error:
        print("错误:", error, file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)  # 打印完整的堆栈跟踪
        return {"error": str(error), "traceback": traceback.format_exc()}

# 如果直接运行脚本，则使用命令行参数或示例数据进行测试
if __name__ == "__main__":
    # 检查是否提供了命令行参数
    if len(sys.argv) > 6:
        print(f"Using command line arguments (total {len(sys.argv)-1} args provided)", file=sys.stderr)
        # 使用命令行参数
        name = sys.argv[1]
        org_type = sys.argv[2]
        description = sys.argv[3]
        target_audience = sys.argv[4]
        preferred_org_type = sys.argv[5]
        partnership_description = sys.argv[6]
        
        # 检查是否提供了行业信息
        industry = sys.argv[7] if len(sys.argv) > 7 else ""
        industry_category = sys.argv[8] if len(sys.argv) > 8 else ""
    else:
        print(f"Warning: Not enough command line arguments (only {len(sys.argv)-1} provided, need 6). Using example data instead.", file=sys.stderr)
        # 使用示例数据
        example_data = {
            "Name": "Animal Welfare Society",
            "Type": "Non Profit",
            "Description": "We are dedicated to protecting and improving the lives of animals through rescue, rehabilitation, and education programs.",
            "Target Audience": "Animal lovers, potential pet adopters, and community members interested in animal welfare",
            "Organization looking 1": "Non Profit",
            "Organization looking 2": "Looking for partnerships with pet food companies, veterinary clinics, and pet supply retailers to support our animal care programs and expand our reach in the community.",
            "Industry": "Animal Welfare",
            "Industry Category": "Non-profit & Philanthropy"
        }
        name = example_data["Name"]
        org_type = example_data["Type"]
        description = example_data["Description"]
        target_audience = example_data["Target Audience"]
        preferred_org_type = example_data["Organization looking 1"]
        partnership_description = example_data["Organization looking 2"]
        industry = example_data["Industry"]
        industry_category = example_data["Industry Category"]
    
    try:
        result = match_organizations(
            name,
            org_type,
            description,
            target_audience,
            preferred_org_type,
            partnership_description,
            industry,
            industry_category
        )
        print("Response:", json.dumps(result, indent=2))
    except Exception as e:
        print(f"执行match_organizations时出错: {e}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        error_response = {"error": str(e), "traceback": traceback.format_exc()}
        print("Response:", json.dumps(error_response, indent=2)) 