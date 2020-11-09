<?php

use humhub\modules\user\models\Password;
use humhub\widgets\Button;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use humhub\widgets\SiteLogo;

/* @var $model Password */

$this->pageTitle = Yii::t('UserModule.auth', 'Change password');
?>
<div class="container" style="text-align: center;">
    <?= SiteLogo::widget(['place' => 'login']); ?>
    <br>

    <div class="row">
        <div id="must-change-password-form" class="panel panel-default animated bounceIn"
             style="max-width: 300px; margin: 0 auto 20px; text-align: left;">
            <div class="panel-heading"><?= Yii::t('UserModule.auth', '<strong>Change</strong> password'); ?></div>
            <div class="panel-body">

                <?php $form = ActiveForm::begin(); ?>

                <p><?= Yii::t('UserModule.auth', 'Please change your password.'); ?></p>

                <?= $form->field($model, 'currentPassword')->passwordInput(['maxlength' => 45]); ?>
                <hr>

                <?= $form->field($model, 'newPassword')->passwordInput(['maxlength' => 45]); ?>

                <?= $form->field($model, 'newPasswordConfirm')->passwordInput(['maxlength' => 45]); ?>

                <hr>
                <?= Html::submitButton(Yii::t('UserModule.auth', 'Change password'), ['class' => 'btn btn-primary', 'data-ui-loader' => ""]); ?>
                <?= Button::danger(Yii::t('UserModule.auth', 'Log out'))->link(Url::toRoute('/user/auth/logout'))->pjax(false) ?>

                <?php ActiveForm::end(); ?>

            </div>
        </div>
    </div>
</div>

<script <?= \humhub\libs\Html::nonce() ?>>
    $(function () {
        // set cursor to current password field
        $('#password-currentpassword').focus();
    });
</script>