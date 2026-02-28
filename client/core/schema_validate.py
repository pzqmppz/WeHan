"""
Schema 校验工具：本地配置上传前校验，避免API调用失败
"""
import json
from jsonschema import validate, ValidationError
from core.logger import logger

def validate_config(config_path: str, schema_path: str) -> bool:
    """
    校验配置文件是否符合 Schema
    :param config_path: 配置文件路径
    :param schema_path: Schema文件路径
    :return: 是否校验通过
    """
    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            schema = json.load(f)
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)

        validate(instance=config, schema=schema)
        logger.info(f"[OK] {config_path} 校验通过")
        return True

    except ValidationError as e:
        logger.error(f"[FAIL] {config_path} 校验失败：{e.message}")
        logger.error(f"  字段路径：{' -> '.join(str(p) for p in e.path)}")
        return False

    except FileNotFoundError as e:
        logger.error(f"[FAIL] 文件不存在：{e.filename}")
        return False

    except json.JSONDecodeError as e:
        logger.error(f"[FAIL] JSON格式错误：{e.msg}")
        return False
