<template>
  <div class="publish-container max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">发布新房源</h2>

    <!-- 步骤条 -->
    <el-steps :active="currentStep" finish-status="success" align-center class="mb-8">
      <el-step title="基础信息" />
      <el-step title="房源图片" />
      <el-step title="配套设施" />
      <el-step title="确认发布" />
    </el-steps>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="form-content"
    >
      <!-- 第一步：基础信息 -->
      <div v-show="currentStep === 0">
        <el-form-item label="房源标题" prop="title">
          <el-input v-model="formData.title" placeholder="例如：市中心精装三居室，采光极佳" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总价(万元)" prop="price">
              <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积(㎡)" prop="area">
              <el-input-number v-model="formData.area" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="户型" prop="houseType">
              <el-select v-model="formData.houseType" placeholder="选择户型" style="width: 100%">
                <el-option label="1室1厅" value="1室1厅" />
                <el-option label="2室1厅" value="2室1厅" />
                <el-option label="2室2厅" value="2室2厅" />
                <el-option label="4室及以上" value="4室及以上" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在区域" prop="district">
              <el-select v-model="formData.district" placeholder="选择区域" style="width: 100%">
                <el-option label="海淀区" value="海淀区" />
                <el-option label="锦江区" value="锦江区" />
                <el-option label="徐汇区" value="徐汇区" />
                <el-option label="福田区" value="福田区" />
                <!-- 根据实际需求扩展 -->
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="小区名称" prop="community">
          <el-input v-model="formData.community" placeholder="输入小区名称" />
        </el-form-item>
      </div>

      <!-- 第二步：房源图片 -->
      <div v-show="currentStep === 1">
        <el-form-item label="上传图片" prop="images">
          <el-upload
            action="http://localhost:8086/upload/image"
            :headers="{ Authorization: `Bearer ${userStore.token}` }"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
            :file-list="fileList"
            :limit="9"
            :before-upload="beforeUpload"
          >
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
          <div class="text-sm text-gray-500 mt-2">支持 jpg/png 格式，最多9张，第一张将作为封面。</div>
        </el-form-item>
      </div>

      <!-- 第三步：配套设施 -->
      <div v-show="currentStep === 2">
        <el-form-item label="配套设施" prop="houseDesc">
          <el-input
            v-model="formData.amenities"
            type="textarea"
            :rows="4"
            placeholder="补充描述房屋周边设施等..."
          />
        </el-form-item>
        <el-form-item label="详细描述" prop="houseDesc">
          <el-input
            v-model="formData.houseDesc"
            type="textarea"
            :rows="4"
            placeholder="补充描述房屋的亮点等..."
          />
        </el-form-item>
      </div>

      <!-- 第四步：确认发布 -->
      <div v-show="currentStep === 3" class="preview-box">
        <el-descriptions title="房源信息预览" border :column="2">
          <el-descriptions-item label="标题">{{ formData.title }}</el-descriptions-item>
          <el-descriptions-item label="价格">{{ formData.price }} 万元</el-descriptions-item>
          <el-descriptions-item label="面积">{{ formData.area }} ㎡</el-descriptions-item>
          <el-descriptions-item label="户型">{{ formData.houseType }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ formData.district }}</el-descriptions-item>
          <el-descriptions-item label="小区">{{ formData.community }}</el-descriptions-item>
          <el-descriptions-item label="配套" :span="2">
            <el-tag v-for="item in formData.features" :key="item" class="mr-1 mb-1">{{ item }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="图片数量" :span="2">{{ fileList.length }} 张</el-descriptions-item>
        </el-descriptions>
        <el-alert
          title="请确认以上信息无误，提交后将进入管理员审核流程。"
          type="warning"
          show-icon
          class="mt-4"
        />
      </div>
    </el-form>

    <!-- 底部操作按钮 -->
    <div class="flex justify-between mt-8 pt-4 border-t border-gray-100">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <el-button v-else disabled></el-button>

      <el-button
        v-if="currentStep < 3"
        type="primary"
        @click="nextStep"
      >
        下一步
      </el-button>
      <el-button
        v-else
        type="success"
        :loading="submitting"
        @click="submitForm"
      >
        立即发布
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'
import useUserStore from '@/stores/user.js'
import useHouseStore from '@/stores/house.js'

const userStore = useUserStore()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const currentStep = ref(0)
const houseStore = useHouseStore()
// 表单数据
const formData = reactive({
  title: '',
  price: null,
  area: null,
  houseType: '',
  district: '',
  community: '',
  features: [],
  // 图片URL列表，提交时传给后端
  image_urls: []
})

// 文件列表用于 el-upload 展示
const fileList = ref([])

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入房源标题', trigger: 'blur' }],
  price: [{ required: true, message: '请输入总价', trigger: 'change' }],
  area: [{ required: true, message: '请输入面积', trigger: 'change' }],
  houseType: [{ required: true, message: '请选择户型', trigger: 'change' }],
  district: [{ required: true, message: '请选择区域', trigger: 'change' }],
  community: [{ required: true, message: '请输入小区名称', trigger: 'blur' }]
}

// 步骤切换逻辑
const nextStep = async () => {
  if (currentStep.value === 0) {
    // 校验第一步基础信息
    const valid = await formRef.value.validateField(['title', 'price', 'area', 'houseType', 'district', 'community']).catch(() => false)
    if (!valid) return
  }
  if (currentStep.value === 1) {
    // 校验图片
    if (fileList.value.length === 0) {
      ElMessage.warning('请至少上传一张房源图片')
      return
    }
  }
  currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 图片上传处理
const handleUploadSuccess = (response, uploadFile) => {
  console.log(response)
  if (response.code === 200) {
    const imageUrl = response.data?.url || response.url
    fileList.value.push(imageUrl)
    // 更新 formData 中的图片链接列表
    formData.image_urls.push(imageUrl)
  } else {
    ElMessage.error('图片上传失败')
  }
}

const handleRemove = (uploadFile) => {
  // 从 fileList 移除时，同步从 formData.image_urls 移除
  // 这里需要根据实际上传逻辑匹配，简单示例直接过滤
  // 注意：el-upload 的 remove 钩子可能需要更精细的逻辑来处理数组索引
  const index = formData.image_urls.indexOf(uploadFile.response?.data?.url || uploadFile.url)
  if (index > -1) {
    formData.image_urls.splice(index, 1)
  }
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  return isImage && isLt2M
}

// 提交表单
const submitForm = async () => {
  submitting.value = true

  try {
    // 构造最终提交的数据
    const payload = {
      ...formData,
      // 确保图片字段符合后端要求，方案中设计为 house_images 表，通常后端接收 URL 列表或单独上传
      imageUrls: formData.image_urls
    }
    console.log(payload)
    const res = await houseStore.createHouse(payload)
    if (res.data.code === 200 || res.data.status === 'success') {
      ElMessage.success('房源发布成功，等待管理员审核！')
      // 跳转到我的房源页面或详情页
      router.push('user/my-houses')
    } else {
      ElMessage.error(res.data.msg || '发布失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.publish-container {
  /* Tailwind 类为主，此处可补充少量自定义样式 */
}

.form-content {
  min-height: 300px;
}

.preview-box {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
}
</style>
