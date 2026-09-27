from decimal import Decimal
import pytest


def calculate_commission(gross_amount: Decimal, platform_percent: float, teacher_percent: float):
    platform_amount = Decimal(str(round(float(gross_amount) * (platform_percent / 100.0), 2)))
    teacher_amount = Decimal(str(round(float(gross_amount) * (teacher_percent / 100.0), 2)))
    return platform_amount, teacher_amount


def test_financial_ledger_decimal_precision():
    course_price = Decimal("5000.00")
    platform_comm_percent = 30.0
    teacher_share_percent = 70.0

    platform_share, teacher_share = calculate_commission(
        course_price, platform_comm_percent, teacher_share_percent
    )

    assert platform_share == Decimal("1500.00")
    assert teacher_share == Decimal("3500.00")
    assert platform_share + teacher_share == course_price


def test_discounted_course_revenue_split():
    course_price = Decimal("2999.00")
    platform_comm_percent = 30.0
    teacher_share_percent = 70.0

    platform_share, teacher_share = calculate_commission(
        course_price, platform_comm_percent, teacher_share_percent
    )

    assert platform_share == Decimal("899.70")
    assert teacher_share == Decimal("2099.30")
    assert platform_share + teacher_share == course_price
