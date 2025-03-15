import requests
import json
import sys

API_BASE_URL = 'https://causeconnect-api.onrender.com'

def match_organizations(name, org_type, description, target_audience, preferred_org_type, partnership_description):
    try:
        example_data = {
            "Name": name,
            "Type": org_type,
            "Description": description,
            "Target Audience": target_audience,
            "Organization looking 1": preferred_org_type,
            "Organization looking 2": partnership_description
        }

        response = requests.post(
            f"{API_BASE_URL}/test/complete-matching-process",
            headers={
                "Content-Type": "application/json"
            },
            json=example_data
        )
        data = response.json()
        print("API响应状态码:", response.status_code)
        print("API响应头:", response.headers)
        print("API响应体:", json.dumps(data, indent=2))
        return data
    except Exception as error:
        print("Error:", error, file=sys.stderr)
        print("调用外部匹配API失败:", error.message)
        print("错误详情:", json.dumps(error, default=str, indent=2))
        return {"error": str(error)}

# 如果直接运行脚本，则使用命令行参数或示例数据进行测试
if __name__ == "__main__":
    # 检查是否提供了命令行参数
    if len(sys.argv) > 6:
        # 使用命令行参数
        name = sys.argv[1]
        org_type = sys.argv[2]
        description = sys.argv[3]
        target_audience = sys.argv[4]
        preferred_org_type = sys.argv[5]
        partnership_description = sys.argv[6]
    else:
        # 使用示例数据
        example_data = {
            "Name": "Animal Welfare Society",
            "Type": "Non Profit",
            "Description": "We are dedicated to protecting and improving the lives of animals through rescue, rehabilitation, and education programs.",
            "Target Audience": "Animal lovers, potential pet adopters, and community members interested in animal welfare",
            "Organization looking 1": "Non Profit",
            "Organization looking 2": "Looking for partnerships with pet food companies, veterinary clinics, and pet supply retailers to support our animal care programs and expand our reach in the community."
        }
        name = example_data["Name"]
        org_type = example_data["Type"]
        description = example_data["Description"]
        target_audience = example_data["Target Audience"]
        preferred_org_type = example_data["Organization looking 1"]
        partnership_description = example_data["Organization looking 2"]
    
    result = match_organizations(
        name,
        org_type,
        description,
        target_audience,
        preferred_org_type,
        partnership_description
    )
    print("Response:", json.dumps(result, indent=2))

    console.log(`用户ID: ${userId}`);
    console.log(`匹配参数: ${JSON.stringify(matchParams)}`); 