"""
密碼策略模組 (LOW 層級)
提供密碼強度檢查、密碼策略驗證、密碼生成建議等功能
"""

import re
import secrets
import string
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum

# 引入 INFO 層級的基礎模組 - 按四層架構依賴
from ..info.info_0.security_constants import PASSWORD_MIN_LENGTH, LOG_LEVELS
from ..info.info_1.security_exceptions import SecurityException, InputValidationError
from ..info.info_1.security_utils import SecurityUtils
from ..info.info_2.security_logger import SecurityLogger, log_security_event
from ..info.info_3.config_manager import get_config


class PasswordStrength(Enum):
    """密碼強度等級"""
    VERY_WEAK = 1
    WEAK = 2
    MEDIUM = 3
    STRONG = 4
    VERY_STRONG = 5


class PasswordPolicy:
    """密碼策略管理器"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.logger = SecurityLogger()
        self.config = config or self._get_default_config()
        
        # 常見弱密碼列表
        self.common_passwords = {
            '123456', '123456789', 'qwerty', 'password', '1234567', '12345678',
            '12345', 'iloveyou', '111111', '123123', 'abc123', 'qwerty123',
            '1q2w3e4r', 'admin', 'qwertyuiop', '654321', '555555', 'lovely',
            '7777777', '888888', 'princess', 'dragon', 'password1', '123qwe'
        }
        
        # 常見密碼模式
        self.weak_patterns = [
            r'^(.)\1{2,}$',  # 重複字符
            r'^(..)\1{2,}$',  # 重複字符對
            r'^\d+$',  # 純數字
            r'^[a-zA-Z]+$',  # 純字母
            r'^[a-z]+$',  # 純小寫
            r'^[A-Z]+$',  # 純大寫
            r'^[a-zA-Z]\d+$',  # 字母+數字
            r'^\d+[a-zA-Z]+$',  # 數字+字母
            r'qwerty|asdf|zxcv',  # 鍵盤順序
            r'123|456|789|abc|def',  # 順序字符
        ]
        
        # 個人信息模式（需要在使用時提供個人信息）
        self.personal_info_keys = ['name', 'username', 'email', 'birthdate', 'phone']
        
        self.logger.info("密碼策略模組初始化完成")
    
    def _get_default_config(self) -> Dict[str, Any]:
        """獲取默認密碼策略配置"""
        return {
            'min_length': 8,
            'max_length': 128,
            'require_uppercase': True,
            'require_lowercase': True,
            'require_digits': True,
            'require_special_chars': True,
            'min_special_chars': 1,
            'max_consecutive_chars': 3,
            'check_common_passwords': True,
            'check_personal_info': True,
            'password_history_count': 5,
            'password_expiry_days': 90,
            'min_age_hours': 24,
            'special_chars': '!@#$%^&*()_+-=[]{}|;:,.<>?',
            'disallowed_chars': ' \t\n\r',
        }
    
    def validate_password(self, password: str, personal_info: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """驗證密碼是否符合策略"""
        result = {
            'is_valid': True,
            'strength': PasswordStrength.MEDIUM,
            'score': 0,
            'errors': [],
            'warnings': [],
            'suggestions': []
        }
        
        try:
            # 基本長度檢查
            if len(password) < self.config['min_length']:
                result['is_valid'] = False
                result['errors'].append(f"密碼長度不能少於 {self.config['min_length']} 個字符")
            
            if len(password) > self.config['max_length']:
                result['is_valid'] = False
                result['errors'].append(f"密碼長度不能超過 {self.config['max_length']} 個字符")
            
            # 字符類型檢查
            has_lower = bool(re.search(r'[a-z]', password))
            has_upper = bool(re.search(r'[A-Z]', password))
            has_digit = bool(re.search(r'\d', password))
            has_special = bool(re.search(f'[{re.escape(self.config["special_chars"])}]', password))
            
            if self.config['require_lowercase'] and not has_lower:
                result['is_valid'] = False
                result['errors'].append("密碼必須包含小寫字母")
            
            if self.config['require_uppercase'] and not has_upper:
                result['is_valid'] = False
                result['errors'].append("密碼必須包含大寫字母")
            
            if self.config['require_digits'] and not has_digit:
                result['is_valid'] = False
                result['errors'].append("密碼必須包含數字")
            
            if self.config['require_special_chars'] and not has_special:
                result['is_valid'] = False
                result['errors'].append(f"密碼必須包含特殊字符 ({self.config['special_chars']})")
            
            # 特殊字符數量檢查
            special_count = len(re.findall(f'[{re.escape(self.config["special_chars"])}]', password))
            if special_count < self.config['min_special_chars']:
                result['is_valid'] = False
                result['errors'].append(f"密碼至少需要 {self.config['min_special_chars']} 個特殊字符")
            
            # 禁用字符檢查
            disallowed = set(password) & set(self.config['disallowed_chars'])
            if disallowed:
                result['is_valid'] = False
                result['errors'].append(f"密碼包含禁用字符: {', '.join(disallowed)}")
            
            # 連續字符檢查
            consecutive_count = self._check_consecutive_chars(password)
            if consecutive_count > self.config['max_consecutive_chars']:
                result['is_valid'] = False
                result['errors'].append(f"密碼不能包含超過 {self.config['max_consecutive_chars']} 個連續相同字符")
            
            # 常見密碼檢查
            if self.config['check_common_passwords'] and password.lower() in self.common_passwords:
                result['is_valid'] = False
                result['errors'].append("密碼太常見，請選擇更安全的密碼")
            
            # 弱密碼模式檢查
            for pattern in self.weak_patterns:
                if re.search(pattern, password, re.IGNORECASE):
                    result['warnings'].append("密碼使用了常見的弱密碼模式")
                    break
            
            # 個人信息檢查
            if self.config['check_personal_info'] and personal_info:
                personal_warnings = self._check_personal_info(password, personal_info)
                if personal_warnings:
                    result['warnings'].extend(personal_warnings)
            
            # 計算密碼強度
            result['strength'], result['score'] = self._calculate_strength(password)
            
            # 生成改進建議
            if not result['is_valid'] or result['strength'].value < 4:
                result['suggestions'] = self._generate_suggestions(password, result)
            
            # 記錄密碼驗證事件
            if not result['is_valid']:
                self.logger.log_security_event(
                    event_type='password_policy_violation',
                    message="Password policy validation failed",
                    priority="LOW",
                    errors_count=len(result['errors']),
                    warnings_count=len(result['warnings'])
                )
            
            return result
            
        except Exception as e:
            self.logger.error(f"密碼驗證失敗: {e}")
            raise SecurityException(f"密碼驗證失敗: {e}")
    
    def _check_consecutive_chars(self, password: str) -> int:
        """檢查連續相同字符的最大數量"""
        max_consecutive = 1
        current_consecutive = 1
        
        for i in range(1, len(password)):
            if password[i] == password[i-1]:
                current_consecutive += 1
                max_consecutive = max(max_consecutive, current_consecutive)
            else:
                current_consecutive = 1
        
        return max_consecutive
    
    def _check_personal_info(self, password: str, personal_info: Dict[str, str]) -> List[str]:
        """檢查密碼是否包含個人信息"""
        warnings = []
        password_lower = password.lower()
        
        for key, value in personal_info.items():
            if value and len(value) >= 3:
                value_lower = value.lower()
                
                # 檢查完整匹配
                if value_lower in password_lower:
                    warnings.append(f"密碼不應包含您的{key}")
                
                # 檢查部分匹配（超過3個字符）
                elif len(value) >= 4:
                    for i in range(len(value) - 3):
                        if value_lower[i:i+4] in password_lower:
                            warnings.append(f"密碼不應包含您的{key}的一部分")
                            break
        
        return warnings
    
    def _calculate_strength(self, password: str) -> Tuple[PasswordStrength, int]:
        """計算密碼強度"""
        score = 0
        
        # 長度分數
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if len(password) >= 16:
            score += 1
        
        # 字符類型分數
        if re.search(r'[a-z]', password):
            score += 1
        if re.search(r'[A-Z]', password):
            score += 1
        if re.search(r'\d', password):
            score += 1
        if re.search(f'[{re.escape(self.config["special_chars"])}]', password):
            score += 1
        
        # 複雜度分數
        char_types = sum([
            bool(re.search(r'[a-z]', password)),
            bool(re.search(r'[A-Z]', password)),
            bool(re.search(r'\d', password)),
            bool(re.search(f'[{re.escape(self.config["special_chars"])}]', password))
        ])
        
        if char_types >= 3:
            score += 1
        if char_types == 4:
            score += 1
        
        # 熵值評估
        entropy = self._calculate_entropy(password)
        if entropy >= 40:
            score += 1
        if entropy >= 60:
            score += 1
        
        # 轉換為強度等級
        if score <= 2:
            return PasswordStrength.VERY_WEAK, score
        elif score <= 4:
            return PasswordStrength.WEAK, score
        elif score <= 6:
            return PasswordStrength.MEDIUM, score
        elif score <= 8:
            return PasswordStrength.STRONG, score
        else:
            return PasswordStrength.VERY_STRONG, score
    
    def _calculate_entropy(self, password: str) -> float:
        """計算密碼熵值"""
        charset_size = 0
        
        if re.search(r'[a-z]', password):
            charset_size += 26
        if re.search(r'[A-Z]', password):
            charset_size += 26
        if re.search(r'\d', password):
            charset_size += 10
        if re.search(f'[{re.escape(self.config["special_chars"])}]', password):
            charset_size += len(self.config["special_chars"])
        
        if charset_size == 0:
            return 0
        
        import math
        return len(password) * math.log2(charset_size)
    
    def _generate_suggestions(self, password: str, validation_result: Dict[str, Any]) -> List[str]:
        """生成密碼改進建議"""
        suggestions = []
        
        if len(password) < 12:
            suggestions.append("增加密碼長度至12個字符以上")
        
        if not re.search(r'[a-z]', password):
            suggestions.append("添加小寫字母")
        
        if not re.search(r'[A-Z]', password):
            suggestions.append("添加大寫字母")
        
        if not re.search(r'\d', password):
            suggestions.append("添加數字")
        
        if not re.search(f'[{re.escape(self.config["special_chars"])}]', password):
            suggestions.append("添加特殊字符（如 !@#$%^&*）")
        
        if validation_result['strength'].value < 4:
            suggestions.append("避免使用常見的密碼模式")
            suggestions.append("使用隨機生成的密碼")
            suggestions.append("考慮使用密碼管理器")
        
        return suggestions
    
    def generate_password(self, length: int = 16, include_similar: bool = False) -> str:
        """生成安全密碼"""
        try:
            if length < self.config['min_length']:
                length = self.config['min_length']
            if length > self.config['max_length']:
                length = self.config['max_length']
            
            # 定義字符集
            lowercase = string.ascii_lowercase
            uppercase = string.ascii_uppercase
            digits = string.digits
            special = self.config['special_chars']
            
            # 移除相似字符
            if not include_similar:
                lowercase = lowercase.replace('l', '').replace('o', '')
                uppercase = uppercase.replace('I', '').replace('O', '')
                digits = digits.replace('0', '').replace('1', '')
                special = special.replace('|', '').replace('l', '')
            
            # 確保至少包含每種類型的字符
            password = []
            password.append(secrets.choice(lowercase))
            password.append(secrets.choice(uppercase))
            password.append(secrets.choice(digits))
            password.append(secrets.choice(special))
            
            # 填充剩餘長度
            all_chars = lowercase + uppercase + digits + special
            for _ in range(length - 4):
                password.append(secrets.choice(all_chars))
            
            # 打亂順序
            secrets.SystemRandom().shuffle(password)
            
            generated_password = ''.join(password)
            
            # 驗證生成的密碼
            validation = self.validate_password(generated_password)
            if not validation['is_valid']:
                # 如果不符合策略，重新生成
                return self.generate_password(length, include_similar)
            
            self.logger.info(f"生成安全密碼，長度: {length}, 強度: {validation['strength'].name}")
            
            return generated_password
            
        except Exception as e:
            self.logger.error(f"密碼生成失敗: {e}")
            raise SecurityException(f"密碼生成失敗: {e}")
    
    def generate_passphrase(self, word_count: int = 4, separator: str = '-') -> str:
        """生成密碼片語"""
        try:
            # 簡單的單詞列表（實際應用中應使用更大的詞典）
            words = [
                'apple', 'river', 'mountain', 'ocean', 'forest', 'sunset', 'flower', 'galaxy',
                'storm', 'bridge', 'castle', 'dragon', 'phoenix', 'crystal', 'thunder', 'rainbow',
                'warrior', 'wizard', 'knight', 'princess', 'treasure', 'adventure', 'journey', 'quest',
                'magic', 'spell', 'potion', 'charm', 'sword', 'shield', 'crown', 'jewel'
            ]
            
            selected_words = []
            for _ in range(word_count):
                word = secrets.choice(words)
                # 隨機大寫首字母
                if secrets.randbelow(2):
                    word = word.capitalize()
                selected_words.append(word)
            
            # 添加隨機數字
            random_numbers = str(secrets.randbelow(999)).zfill(2)
            selected_words.append(random_numbers)
            
            # 添加特殊字符
            special_char = secrets.choice('!@#$%^&*')
            
            passphrase = separator.join(selected_words) + special_char
            
            self.logger.info(f"生成密碼片語，單詞數: {word_count}")
            
            return passphrase
            
        except Exception as e:
            self.logger.error(f"密碼片語生成失敗: {e}")
            raise SecurityException(f"密碼片語生成失敗: {e}")
    
    def check_password_history(self, new_password: str, password_history: List[str]) -> bool:
        """檢查密碼是否在歷史記錄中"""
        try:
            new_hash = hashlib.sha256(new_password.encode()).hexdigest()
            
            for old_password in password_history[-self.config['password_history_count']:]:
                if isinstance(old_password, str):
                    # 假設歷史密碼已經是哈希值
                    if old_password == new_hash:
                        return False
                elif SecurityUtils.verify_password(new_password, old_password, ""):
                    return False
            
            return True
            
        except Exception as e:
            self.logger.error(f"密碼歷史檢查失敗: {e}")
            return True  # 發生錯誤時允許使用新密碼
    
    def is_password_expired(self, last_change_date: datetime) -> bool:
        """檢查密碼是否過期"""
        if self.config['password_expiry_days'] <= 0:
            return False
        
        expiry_date = last_change_date + timedelta(days=self.config['password_expiry_days'])
        return datetime.now() > expiry_date
    
    def get_password_age_status(self, last_change_date: datetime) -> Dict[str, Any]:
        """獲取密碼年齡狀態"""
        age = datetime.now() - last_change_date
        days_old = age.days
        
        expiry_days = self.config['password_expiry_days']
        if expiry_days <= 0:
            return {
                'is_expired': False,
                'days_old': days_old,
                'days_until_expiry': None,
                'status': 'no_expiry'
            }
        
        days_until_expiry = expiry_days - days_old
        
        if days_until_expiry <= 0:
            status = 'expired'
        elif days_until_expiry <= 7:
            status = 'expiring_soon'
        elif days_until_expiry <= 30:
            status = 'expiring_this_month'
        else:
            status = 'valid'
        
        return {
            'is_expired': days_until_expiry <= 0,
            'days_old': days_old,
            'days_until_expiry': max(0, days_until_expiry),
            'status': status
        }


# 便利函數
def validate_password_strength(password: str, personal_info: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """快速驗證密碼強度"""
    policy = PasswordPolicy()
    return policy.validate_password(password, personal_info)

def generate_secure_password(length: int = 16) -> str:
    """快速生成安全密碼"""
    policy = PasswordPolicy()
    return policy.generate_password(length)

def generate_passphrase(word_count: int = 4) -> str:
    """快速生成密碼片語"""
    policy = PasswordPolicy()
    return policy.generate_passphrase(word_count)


if __name__ == "__main__":
    # 測試密碼策略
    policy = PasswordPolicy()
    
    # 測試密碼驗證
    test_passwords = [
        "123456",  # 弱密碼
        "Password123",  # 中等密碼
        "MyStr0ng!P@ssw0rd",  # 強密碼
    ]
    
    for pwd in test_passwords:
        result = policy.validate_password(pwd)
        print(f"密碼: {pwd}")
        print(f"強度: {result['strength'].name}, 分數: {result['score']}")
        print(f"有效: {result['is_valid']}")
        if result['errors']:
            print(f"錯誤: {result['errors']}")
        if result['suggestions']:
            print(f"建議: {result['suggestions']}")
        print("-" * 40)
    
    # 測試密碼生成
    generated = policy.generate_password(16)
    print(f"生成的密碼: {generated}")
    
    # 測試密碼片語生成
    passphrase = policy.generate_passphrase()
    print(f"生成的密碼片語: {passphrase}")
    
    print("密碼策略測試完成")
