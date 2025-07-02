#!/usr/bin/env python3
"""
依賴關係驗證腳本
驗證 secure-dependencies.yaml 配置與實際代碼的一致性
"""

import yaml
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Set

def load_config() -> Dict[str, Any]:
    """載入依賴配置文件"""
    config_path = Path("security/configs/secure-dependencies.yaml")
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def check_file_exists(file_path: str) -> bool:
    """檢查文件是否存在"""
    return Path(file_path).exists()

def extract_imports_from_file(file_path: str) -> Dict[str, List[str]]:
    """從文件中提取導入信息"""
    if not Path(file_path).exists():
        return {"external": [], "internal": []}
    
    external_imports = []
    internal_imports = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        for line in lines:
            line = line.strip()
            
            # 檢查 import 語句
            if line.startswith('import ') and not line.startswith('import .'):
                module = line.replace('import ', '').split(' as ')[0].split('.')[0].split(' #')[0].strip()
                if module not in external_imports:
                    external_imports.append(module)
            
            # 檢查 from ... import 語句
            elif line.startswith('from '):
                if ' import ' in line:
                    module_part = line.split(' import ')[0].replace('from ', '').split(' #')[0].strip()
                    if module_part.startswith('..'):
                        # 內部導入
                        internal_imports.append(module_part)
                    elif not module_part.startswith('.'):
                        # 外部導入
                        root_module = module_part.split('.')[0]
                        if root_module not in external_imports:
                            external_imports.append(root_module)
    
    except Exception as e:
        print(f"❌ 讀取文件 {file_path} 時發生錯誤: {e}")
    
    return {"external": external_imports, "internal": internal_imports}

def validate_dependencies():
    """驗證依賴關係"""
    print("🔍 開始驗證依賴關係...")
    config = load_config()
    
    # 統計信息
    total_modules = 0
    valid_modules = 0
    missing_files = []
    dependency_mismatches = []
    
    # 檢查 INFO 層級
    for level_name, level_config in config.get('info_levels', {}).items():
        print(f"\n📋 檢查 {level_name} 層級...")
        
        for module_name, module_config in level_config.get('modules', {}).items():
            total_modules += 1
            file_path = module_config['file_path']
            
            print(f"  🔍 檢查模組: {module_name}")
            print(f"     文件路徑: {file_path}")
            
            # 檢查文件是否存在
            if not check_file_exists(file_path):
                missing_files.append(file_path)
                print(f"     ❌ 文件不存在")
                continue
            
            # 提取實際導入
            actual_imports = extract_imports_from_file(file_path)
            
            # 檢查外部依賴
            expected_external = set(module_config.get('external_dependencies', []))
            actual_external = set(actual_imports['external'])
            
            if expected_external != actual_external:
                missing_external = expected_external - actual_external
                extra_external = actual_external - expected_external
                
                if missing_external or extra_external:
                    dependency_mismatches.append({
                        'module': f"{level_name}/{module_name}",
                        'file': file_path,
                        'type': 'external',
                        'missing': list(missing_external),
                        'extra': list(extra_external)
                    })
                    print(f"     ⚠️  外部依賴不匹配")
                    if missing_external:
                        print(f"        缺少: {missing_external}")
                    if extra_external:
                        print(f"        多餘: {extra_external}")
                else:
                    print(f"     ✅ 外部依賴匹配")
            else:
                print(f"     ✅ 外部依賴匹配")
            
            valid_modules += 1
    
    # 檢查 LOW 層級
    if 'low_level' in config:
        print(f"\n📋 檢查 LOW 層級...")
        
        for module_name, module_config in config['low_level']['modules'].items():
            total_modules += 1
            file_path = module_config['file_path']
            
            print(f"  🔍 檢查模組: {module_name}")
            print(f"     文件路徑: {file_path}")
            
            # 檢查文件是否存在
            if not check_file_exists(file_path):
                missing_files.append(file_path)
                print(f"     ❌ 文件不存在")
                continue
            
            # 提取實際導入
            actual_imports = extract_imports_from_file(file_path)
            
            # 檢查外部依賴
            expected_external = set(module_config.get('external_dependencies', []))
            actual_external = set(actual_imports['external'])
            
            if expected_external != actual_external:
                missing_external = expected_external - actual_external
                extra_external = actual_external - expected_external
                
                if missing_external or extra_external:
                    dependency_mismatches.append({
                        'module': f"low/{module_name}",
                        'file': file_path,
                        'type': 'external',
                        'missing': list(missing_external),
                        'extra': list(extra_external)
                    })
                    print(f"     ⚠️  外部依賴不匹配")
                    if missing_external:
                        print(f"        缺少: {missing_external}")
                    if extra_external:
                        print(f"        多餘: {extra_external}")
                else:
                    print(f"     ✅ 外部依賴匹配")
            else:
                print(f"     ✅ 外部依賴匹配")
            
            valid_modules += 1
    
    # 輸出總結
    print("\n" + "="*60)
    print("📊 驗證結果總結")
    print("="*60)
    print(f"📁 總模組數: {total_modules}")
    print(f"✅ 有效模組數: {valid_modules}")
    print(f"❌ 缺失文件數: {len(missing_files)}")
    print(f"⚠️  依賴不匹配數: {len(dependency_mismatches)}")
    
    if missing_files:
        print(f"\n❌ 缺失的文件:")
        for file in missing_files:
            print(f"   - {file}")
    
    if dependency_mismatches:
        print(f"\n⚠️  依賴不匹配:")
        for mismatch in dependency_mismatches:
            print(f"   📦 {mismatch['module']} ({mismatch['file']})")
            if mismatch['missing']:
                print(f"      缺少: {mismatch['missing']}")
            if mismatch['extra']:
                print(f"      多餘: {mismatch['extra']}")
    
    if not missing_files and not dependency_mismatches:
        print("\n🎉 所有依賴關係驗證通過！")
        return True
    else:
        print(f"\n⚠️  發現 {len(missing_files + dependency_mismatches)} 個問題需要修正")
        return False

if __name__ == "__main__":
    success = validate_dependencies()
    sys.exit(0 if success else 1)
