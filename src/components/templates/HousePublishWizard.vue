<template>
  <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 顶部标题区 -->
    <div class="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-2xl font-bold text-gray-800">发布新房源</h2>
      <p class="text-sm text-gray-500 mt-1">请填写真实有效的房源信息，审核通过后即可展示给购房者</p>
    </div>

    <!-- 步骤条 -->
    <div class="px-8 py-6">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="基础信息" description="填写房源核心参数" />
        <el-step title="图片上传" description="展示房源真实面貌" />
        <el-step title="配套设施" description="完善生活配套细节" />
        <el-step title="预览提交" description="确认信息无误后发布" />
      </el-steps>
    </div>

    <!-- 表单内容区 -->
    <div class="px-8 pb-8 min-h-[400px]">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
        class="mt-6"
      >
        <!-- 步骤 1: 基础信息 -->
        <div v-show="currentStep === 0" class="animate-fade-in">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <el-form-item label="房源标题" prop="title">
              <el-input
                v-model="formData.title"
                placeholder="例如：阳光花园 精装三居室 采光极佳"
                class="w-full"
              />
            </el-form-item>

            <el-form-item label="所在区域" prop="district">
              <el-select v-model="formData.district" placeholder="请选择区域" class="w-full">
                <el-option label="朝阳区" value="朝阳区" />
                <el-option label="海淀区" value="海淀区" />
                <el-option label="丰台区" value="丰台区" />
                <el-option label="东城区" value="东城区" />
                <el-option label="西城区" value="西城区" />
              </el-select>
            </el-form-item>

            <el-form-item label="小区名称" prop="community">
              <el-input v-model="formData.community" placeholder="请输入小区名称" />
            </el-form-item>

            <el-form-item label="户型结构" prop="house_type">
              <el-input v-model="formData.house_type" placeholder="例如：3室2厅1卫" />
            </el-form-item>

            <el-form-item label="建筑面积 (㎡)" prop="area">
              <el-input-number
                v-model="formData.area"
                :min="10"
                :max="1000"
                class="w-full"
                controls-position="right"
              />
            </el-form-item>

            <el-form-item label="出售价格 (万元)" prop="price">
              <el-input-number
                v-model="formData.price"
                :min="10"
                :precision="2"
                class="w-full"
                controls-position="right"
              />
            </el-form-item>
          </div>

          <el-form-item label="房源描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="详细描述房屋朝向、装修情况、周边设施等优势..."
            />
          </el-form-item>
        </div>

        <!-- 步骤 2: 图片上传 -->
        <div v-show="currentStep === 1" class="animate-fade-in flex flex-col items-center justify-center py-4">
          <div class="w-full max-w-2xl">
            <el-alert
              title="图片规范"
              type="info"
              :closable="false"
              show-icon
              class="mb-4"
              description="请上传至少3张清晰实拍图，支持 JPG/PNG 格式，单张不超过5MB。首图将作为封面展示。"
            />
            <!-- 复用原子组件 EImageUpload -->
            <!-- 假设 EImageUpload 暴露了 modelValue 用于绑定图片列表 -->
            <e-image-upload
              v-model="formData.images"
              :limit="9"
              tip="最多可上传9张图片"
            />
          </div>
        </div>

        <!-- 步骤 3: 配套设施 -->
        <div v-show="currentStep === 2" class="animate-fade-in">
          <el-form-item label="内部配套" prop="amenities_interior">
            <el-checkbox-group v-model="formData.amenities_interior" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <el-checkbox label="南北通透" name="interior" />
              <el-checkbox label="精装修" name="interior" />
              <el-checkbox label="拎包入住" name="interior" />
              <el-checkbox label="地暖" name="interior" />
              <el-checkbox label="中央空调" name="interior" />
              <el-checkbox label="阳台" name="interior" />
              <el-checkbox label="飘窗" name="interior" />
              <el-checkbox label="储物间" name="interior" />
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="小区配套" prop="amenities_community">
            <el-checkbox-group v-model="formData.amenities_community" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <el-checkbox label="停车位" name="community" />
              <el-checkbox label="电梯" name="community" />
              <el-checkbox label="绿化率高" name="community" />
              <el-checkbox label="物业管理" name="community" />
              <el-checkbox label="儿童游乐区" name="community" />
              <el-checkbox label="健身设施" name="community" />
              <el-checkbox label="人车分流" name="community" />
              <el-checkbox label="门禁系统" name="community" />
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="周边配套" prop="amenities_surrounding">
            <el-checkbox-group v-model="formData.amenities_surrounding" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <el-checkbox label="近地铁" name="surrounding" />
              <el-checkbox label="近公交" name="surrounding" />
              <el-checkbox label="购物中心" name="surrounding" />
              <el-checkbox label="超市" name="surrounding" />
              <el-checkbox label="医院" name="surrounding" />
              <el-checkbox label="学校" name="surrounding" />
              <el-checkbox label="公园" name="surrounding" />
              <el-checkbox label="银行" name="surrounding" />
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- 步骤 4: 预览提交 -->
        <div v-show="currentStep === 3" class="animate-fade-in">
          <div class="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-6">
            <!-- 头部概览 -->
            <div class="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-6">
              <div class="w-full md:w-1/3">
                <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                  <img
                    v-if="formData.images && formData.images.length > 0"
                    :src="formData.images[0].url || formData.images[0]"
                    alt="封面图"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">无图片</div>
                  <div class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {{ formData.images?.length || 0 }} 张图
                  </div>
                </div>
              </div>
              <div class="w-full md:w-2/3 space-y-3">
                <h3 class="text-xl font-bold text-gray-800">{{ formData.title || '未填写标题' }}</h3>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span class="flex items-center gap-1"><i class="el-icon-location"></i> {{ formData.district }} - {{ formData.community }}</span>
                  <span class="flex items-center gap-1"><i class="el-icon-office-building"></i> {{ formData.house_type }}</span>
                  <span class="flex items-center gap-1"><i class="el-icon-ruler"></i> {{ formData.area }}㎡</span>
                </div>
                <div class="text-2xl font-bold text-red-500">
                  ¥ {{ formData.price }} <span class="text-sm text-gray-500 font-normal">万元</span>
                </div>
              </div>
            </div>

            <!-- 详情罗列 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">房源描述</h4>
                <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {{ formData.description || '暂无详细描述' }}
                </p>
              </div>
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">配套标签</h4>
                <div class="flex flex-wrap gap-2">
                  <el-tag
                    v-for="tag in allAmenities"
                    :key="tag"
                    size="small"
                    effect="plain"
                    class="bg-blue-50 text-blue-600 border-blue-100"
                  >
                    {{ tag }}
                  </el-tag>
                  <span v-if="allAmenities.length === 0" class="text-gray-400 text-sm">未选择配套</span>
                </div>
              </div>
            </div>

            <el-alert
              title="提交须知"
              type="warning"
              :closable="false"
              show-icon
              class="mt-4"
              description="提交后房源将进入审核状态，审核期间无法修改，请耐心等待管理员审核结果。"
            />
          </div>
        </div>
      </el-form>
    </div>

    <!-- 底部操作栏 -->
    <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
      <el-button
        v-if="currentStep > 0"
        @click="prevStep"
        class="px-6"
      >
        上一步
      </el-button>
      <div class="flex-1"></div> <!-- 占位符，确保按钮靠右或居中 -->

      <el-button
        v-if="currentStep < 3"
        type="primary"
        @click="nextStep"
        class="px-8"
        :loading="loading"
      >
        下一步
      </el-button>

      <el-button
        v-else
        type="success"
        @click="submitForm"
        class="px-8"
        :loading="loading"
      >
        立即发布
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 假设原子组件已在全局注册或在项目中正确引入
// import EImageUpload from '@/components/atoms/EImageUpload.vue';

const formRef = ref(null);
const loading = ref(false);
const currentStep = ref(0);

// 表单数据模型
const formData = reactive({
  title: '',
  district: '',
  community: '',
  house_type: '',
  area: null,
  price: null,
  description: '',
  images: [], // 存储图片对象或URL
  amenities_interior: [],
  amenities_community: [],
  amenities_surrounding: []
});

// 验证规则
const rules = {
  title: [{ required: true, message: '请输入房源标题', trigger: 'blur' }],
  district: [{ required: true, message: '请选择所在区域', trigger: 'change' }],
  community: [{ required: true, message: '请输入小区名称', trigger: 'blur' }],
  house_type: [{ required: true, message: '请输入户型结构', trigger: 'blur' }],
  area: [{ required: true, message: '请输入建筑面积', trigger: 'blur' }],
  price: [{ required: true, message: '请输入出售价格', trigger: 'blur' }],
  images: [
    { required: true, message: '请至少上传一张房源图片', trigger: 'change', validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少上传一张房源图片'));
        } else {
          callback();
        }
      }}
  ]
};

// 计算所有选中的配套标签，用于预览
const allAmenities = computed(() => {
  return [
    ...formData.amenities_interior,
    ...formData.amenities_community,
    ...formData.amenities_surrounding
  ];
});

// 步骤切换逻辑
const nextStep = async () => {
  if (!formRef.value) return;

  // 针对当前步骤的字段进行校验
  let validateFields = [];
  if (currentStep.value === 0) {
    validateFields = ['title', 'district', 'community', 'house_type', 'area', 'price'];
  } else if (currentStep.value === 1) {
    validateFields = ['images'];
  }

  if (validateFields.length > 0) {
    try {
      await formRef.value.validateField(validateFields);
      currentStep.value++;
    } catch (error) {
      ElMessage.warning('请填写完整当前步骤的必填项');
    }
  } else {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 提交逻辑
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    // 模拟 API 请求
    setTimeout(() => {
      loading.value = false;
      ElMessageBox.success({
        title: '发布成功',
        message: '您的房源已提交审核，预计将在24小时内完成审核。',
        confirmButtonText: '查看我的房源'
      }).then(() => {
        // 这里可以路由跳转到我的房源页面
        console.log('跳转逻辑', formData);
      });
    }, 1500);

  } catch (error) {
    ElMessage.error('表单验证失败，请检查所有必填项');
  }
};
</script>

<style scoped>
/* 简单的淡入动画 */
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 自定义滚动条美化（可选） */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}
</style>
